import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Session } from "./Session";
import { Musician } from "./Musician";

@Entity()
export class GasUp {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Musician, (musician) => musician.gasUps)
  musician: Musician;

  @ManyToOne((type) => Session, (session) => session.gasUps)
  session: Session;
}
