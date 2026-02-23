import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventPayload } from '../../../ingestion/domain/EventPayload';
import { TemplateCompilerService } from '../../../template/application/TemplateCompilerService';
import { PreferencesService } from '../../../preferences/application/PreferencesService';
import { CHANNEL_PROVIDERS, IChannelProvider } from './IChannelProvider';
import { PreferencesNotFoundError } from '../../../preferences/domain/errors/PreferencesNotFoundError';

@Injectable()
export class DispatcherService {
    private readonly logger = new Logger(DispatcherService.name);

    constructor(
        private readonly templateService: TemplateCompilerService,
        private readonly preferencesService: PreferencesService,
        @Inject(CHANNEL_PROVIDERS) private readonly channelProviders: IChannelProvider[],
    ) { }

    public async dispatchEvent(event: EventPayload, correlationId: string): Promise<void> {
        this.logger.debug(`[Trace: ${correlationId}] Dispatching eventType ${event.eventType} for recipient ${event.recipientId}`);

        // 1. Resolve Preferences
        let preferences;
        try {
            preferences = await this.preferencesService.getPreferences(event.recipientId);
        } catch (error) {
            if (error instanceof PreferencesNotFoundError) {
                this.logger.warn(`[Trace: ${correlationId}] No preferences found for user ${event.recipientId}. Discarding event.`);
                return; // Business rule: Discard if no explicit preferences are created.
            }
            throw error;
        }

        // 2. Resolve and Compile Template
        const compiled = await this.templateService.compileTemplate(event.eventType, event.metadata);

        // 3. Dispatch to Allowed Target Channels
        const dispatchPromises = [];

        for (const provider of this.channelProviders) {
            if (preferences.canReceiveEventVia(event.eventType, provider.channelType)) {
                this.logger.log(`[Trace: ${correlationId}] Routing to channel ${provider.channelType}`);
                dispatchPromises.push(provider.send(event.recipientId, compiled.subject, compiled.body, correlationId));
            } else {
                this.logger.debug(`[Trace: ${correlationId}] Channel ${provider.channelType} ignored due to user preferences`);
            }
        }

        if (dispatchPromises.length === 0) {
            this.logger.log(`[Trace: ${correlationId}] Event ${event.eventId} discarded as no active channels matched user preferences`);
            return;
        }

        // Await all dispatch promises
        await Promise.all(dispatchPromises);
        this.logger.log(`[Trace: ${correlationId}] Event ${event.eventId} successfully dispatched across ${dispatchPromises.length} channel(s)`);
    }
}
