import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  memberId: string;

  @Column()
  memberUsername: string;

  @Column()
  memberAvatarId: string;

  @Column()
  memberEmail: string;

  @Column()
  memberPassword: string;

  @Column()
  memberSince: Date;

  @Column()
  memberTotalSessions: number;

  @Column()
  memberTotalPracticeMinutes: number;

  @Column()
  memberTotalGasUpsGiven: number;

  @Column()
  memberTotalGasUpsRecieved: number;

  @Column()
  memberLongestStreak: number;

  @Column()
  memberCurrentStreak: number;
}
