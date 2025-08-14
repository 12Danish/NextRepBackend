import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const getSleepGoalProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

const getWorkoutGraphProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

const getDietGoalProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

const getDietGraphProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

const getWeightGoalProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

const getWeightGraphProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

const getWorkoutGoalProgressController = async (req: any, res: Response, next: NextFunction) => {
  // your logic here
};

export {
  getDietGoalProgressController,
  getDietGraphProgressController,
  getSleepGoalProgressController,
  getWeightGraphProgressController,
  getWorkoutGoalProgressController,
  getWeightGoalProgressController,
  getWorkoutGraphProgressController,
};
