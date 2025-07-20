import Sleep, { ISleep } from "../models/SleepModel";
import { CustomError } from "../utils/customError";

interface SleepInput {
    userId: string;
    duration: number;
    date: Date;
    goalId: string;
}

class SleepServices {
    /**
     * Creates a new sleep entry for a user
     */
    static async createSleepService(sleepInput: SleepInput): Promise<ISleep> {
        const { userId, duration, date, goalId } = sleepInput;
        const sleep = await Sleep.create({ userId, duration, date, goalId });
        return sleep;
    }

    /**
     * Gets all sleep entries for a user
     */
    static async getSleepService(userId: string): Promise<ISleep[]> {
        const sleep = await Sleep.find({ userId });
        return sleep;
    }

    /**
     * Gets a sleep entry by id
     */
    static async getSleepByIdService(sleepId: string): Promise<ISleep> {
        const sleep = await Sleep.findById(sleepId);
        if (!sleep) {
            throw new CustomError("Sleep entry not found", 404);
        }
        return sleep;
    }

    /**
     * Updates a sleep entry by id
     */
    static async updateSleepService(sleepId: string, sleepInput: SleepInput): Promise<ISleep> {
        const sleep = await Sleep.findByIdAndUpdate(sleepId, sleepInput, { new: true });
        if (!sleep) {
            throw new CustomError("Sleep entry not found", 404);
        }
        return sleep;
    }
    
    /**
     * Deletes a sleep entry by id
     */
    static async deleteSleepService(sleepId: string): Promise<ISleep> {
        const sleep = await Sleep.findByIdAndDelete(sleepId);
        if (!sleep) {
            throw new CustomError("Sleep entry not found", 404);
        }
        return sleep;
    }

    /**
     * Gets a sleep entry by date
     */
    static async getSleepByDateService(date: Date): Promise<ISleep | null> {
        const sleep = await Sleep.findOne({ date });
        return sleep;
    }

    /**
     * Get sleep stats for a user
     */
    static async getSleepStatsService(userId: string): Promise<ISleep[]> {
        const sleep = await Sleep.find({ userId });
        return sleep;
    }

    /**
     * Create multiple sleep records for a user
     */
    static async createMultipleSleepService(sleepInput: SleepInput[]): Promise<ISleep[]> {
        const sleepDocs = await Sleep.insertMany(sleepInput);
        return sleepDocs.map(doc => doc.toObject() as ISleep);
    }   
}
export default SleepServices;