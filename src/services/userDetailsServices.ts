import { User } from "../models/UserModel";
interface UpdateUserDetailsServiceProps {
  phone_num: string;
  dob: Date;
  country: string;
  height: number;
  weight: number;
}

class UserDetailsServices {
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

    return updatedUser;
  }
}

export { UserDetailsServices };
