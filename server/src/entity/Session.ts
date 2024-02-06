import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { GasUp } from "./GasUp";
import { Musician } from "./Musician";
import { Comment } from "./Comment";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  notes: string;

  @Column()
  duration: number; // Duration in minutes

  @Column()
  isPublic: boolean;

  @Column()
  takeId: string; // Identifier for the media BLOB saved elsewhere

  @CreateDateColumn()
  date: Date;

  @ManyToOne((type) => Musician, (musician) => musician.sessions)
  musician: Musician;

  @OneToMany((type) => GasUp, (like) => like.session)
  gasUps: GasUp[];

  @OneToMany((type) => Comment, (comment) => comment.session)
  comments: Comment[];
}
