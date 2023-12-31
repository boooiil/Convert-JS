import { Log } from 'logging/Log'
import { ApplicationEncodingDecision } from './ApplicationEncodingDecision'
import { Settings } from './Settings'
import { UserCapabilities } from './UserCapabilities'
import { Media } from 'media/Media'
import { UserArguments } from './UserArguments'
import { readdirSync } from 'fs'

/**
 * This class contains the bulk of information for the current and pending conversions
 * as well as user and application decisions.
 */
export class Container {

    logger: Log = new Log()

    /** Instance of ApplicationEncodingDecision */
    appEncodingDecision: ApplicationEncodingDecision
    /** Instance of Settings */
    settings: Settings

    /** Instance of UserCapabilities */
    userCapabilities: UserCapabilities

    /** List of files currently being processed */
    converting: { [key: string]: Media } = {}
    /** List of files pending processing */
    pending: Media[] = []

    /** Instance of UserArguments */
    userArguments: UserArguments

    constructor() {

        this.appEncodingDecision = new ApplicationEncodingDecision()
        this.settings = new Settings()

        this.userCapabilities = new UserCapabilities()

        this.userArguments = new UserArguments()

    }

    

    /**
     * This function scans the working directory for media files and adds them to the pending queue.
     */
    scanWorkingDir() {

        return new Promise((resolve) => {
            readdirSync(this.settings.workingDir).forEach((file) => {

                if (file.endsWith('.mkv')) {

                    Log.debug('Found file: ', file)

                    let media = new Media(file, this.settings.workingDir)

                    media.rename(this)

                    this.pending.push(media)

                }

            })

            setTimeout(() => {
                resolve(null)
            }, 1000)

        })
    }

}