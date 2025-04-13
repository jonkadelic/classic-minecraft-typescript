export interface ProgressListener {
    progressStart(title: string): void
    progressStage(status: string): void
    progressStagePercentage(i: number): void
}