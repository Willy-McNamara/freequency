import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Musician } from "./Musician";
import { Session } from "./Session";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne((type) => Musician, (musician) => musician.comments)
  musician: Musician;

  @ManyToOne((type) => Session, (session) => session.comments)
  session: Session;
}
