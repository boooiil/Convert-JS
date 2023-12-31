import { writeFileSync } from 'fs'
import { LogColor } from 'logging/LogColor'
import { Container } from './Container'
import { Display } from './Display'
import { Activity } from './Activity'
import { Log } from 'logging/Log'
import { Debug } from './Debug'

/**
 * This class runs the base of the application. The current running conversion count is checked against
 * the user's desired amount of conversions. If the current amount is less than the desired amount, a
 * new conversion is started.
 */
export class Ticker {

    /** Instance of Container */
    container: Container
    /** Instance of Display */
    display: Display

    /**
     * 
     * @param container The container object that contains all of the information about the current and pending conversions.
     */
    constructor(container: Container) {

        this.container = container
        this.display = new Display(container)

    }

    /**
     * This function starts the processing of the files.
     */
    startProcess() {

        //NOTE: An item gets added every second instead of all at once due to the logic being contained in an interval.
        //CONT: We could move this to a recursive function that is called every second, but that's no fun.
        setInterval(() => {

            let currentAmount = Object.keys(this.container.converting).length

            if (currentAmount < this.container.appEncodingDecision.amount) {

                let media = this.container.pending[0]

                if (!media || media.activity !== Activity.WAITING) {

                    if (currentAmount === 0) {

                        this.container.logger.flushBuffer()
                        if (Debug.toggle) {
                            Log.debug('Debugging enabled. Writing debug file.')
                            writeFileSync('container_debug.json', JSON.stringify(this.container, null, 4))
                            Log.debug('Debug file written.')
                            process.exit(0)
                        }
                        else process.exit(0)

                    }

                }
                else {

                    media.activity = Activity.WAITING_STATISTICS
                    media.started = Date.now()

                    this.container.converting[media.name] = this.container.pending.shift()

                }

            }

            if (currentAmount > this.container.appEncodingDecision.amount) {

                Log.send(LogColor.fgRed, 'CURRENT TRANSCODES ARE GREATER THAN THE ALLOWED AMOUNT.')
                Log.send(LogColor.fgRed, 'CURRENT ALLOWED AMOUNT: ' + this.container.appEncodingDecision.amount)
                Log.send(LogColor.fgRed, 'CURRENT QUEUE:')
                Object.keys(this.container.converting).forEach(media => console.error('CURRENT FILE: ' + this.container.converting[media].file.modifiedFileName))
                process.exit(1)

            }

            Object.keys(this.container.converting).forEach(file => {

                let media = this.container.converting[file]

                // If the file is not being processed, spawn an instance for it.
                if (!media.isProcessing()) {

                    if (media.activity === Activity.WAITING_STATISTICS) media.doStatistics(this.container)
                    //if (media.activity.includes('Extracting')) spawnExtractionInstance(media)
                    if (media.activity === Activity.WAITING_CONVERT) media.doConvert(this.container)
                    if (media.activity === Activity.WAITING_VALIDATE) media.doValidate(this.container)

                }

                // If the file has finished processing, add it to the completed queue.
                if (/finished|failed/i.test(media.activity)) {

                    media.ended = Date.now()

                    this.container.pending.push(structuredClone(media))

                    delete this.container.converting[media.name]

                }

            })

            if (Debug.toggle) this.display.printDebug()
            else this.display.print()

        }, 1000)

    }

}