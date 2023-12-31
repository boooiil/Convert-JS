import { Container } from 'application/Container'
import * as child from 'child_process'
import { Media } from './Media'
import { Activity } from 'application/Activity'
import { Log } from 'logging/Log'
import { LogColor } from 'logging/LogColor'

export class MediaProcess {

    container: Container
    media: Media
    child: child.ChildProcess

    constructor(container: Container, media: Media) {
        this.container = container
        this.media = media
    }

    hasChildProcess() {
        return this.child !== undefined
    }

    isDone() {
        return this.child.exitCode !== null
    }

    async stop(): Promise<void> {
        if (this.hasChildProcess()) {
            Log.send(LogColor.fgRed, 'Killing process: ', this.media.file.modifiedFileName)
            this.child.kill()
        }
    }

    async start(): Promise<Activity> { return null }

}