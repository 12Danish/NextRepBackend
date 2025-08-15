import { User } from "../models/UserModel";
import { CustomError } from "../utils/customError";

interface UpdateUserDetailsServiceProps {
  phone_num: string;
  dob: Date;
  country: string;
  height: number;
  weight: number;
}

class UserDetailsServices {
  static async getUserDetailsService(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return user;
  }

  static async updateUserDetailsService({
    userId,
    updates,
  }: {
    userId: string;
    updates: Partial<UpdateUserDetailsServiceProps>;
  }) {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new CustomError("User not found", 404);
    }

    return updatedUser;
  }
}

export { UserDetailsServices };
