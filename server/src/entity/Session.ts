import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  sessionId: string;

  @Column()
  memberID: string;

  @Column()
  sessionTitle: string;

  @Column()
  sessionDuration: number;

  @Column()
  sessionNotes: string;

  @Column()
  sessionPublic: boolean;

  @Column()
  sessionTakeID: string;

  @Column()
  sessionDateTime: Date;
}
