export class InvalidTradeExecutionDateError extends Error {
  constructor(executedAt: Date) {
    super(
      `Trade execution date cannot be in the future: ${executedAt.toISOString()}`,
    );
    this.name = 'InvalidTradeExecutionDateError';
  }
}
