export interface ProgressListener {
    progressStart(title: string): void
    progressStage(title: string): void
    progressStagePercentage(progress: number): void
}