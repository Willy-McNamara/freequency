import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Session } from "./Session";
import { Comment } from "./Comment";

@Entity()
export class Musician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  googleId: string; // Google-based authentication ID

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column()
  totalSessions: number;

  @Column()
  totalPracticeMinutes: number;

  @Column()
  gasUps: number;

  @Column()
  longestStreak: number;

  @Column()
  currentStreak: number;

  @OneToMany((type) => Comment, (comment) => comment.musician)
  comments;

  @OneToMany((type) => Session, (session) => session.musician)
  sessions: Session[];
}
