import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  postId: string;

  @Column()
  memberId: string;

  @Column()
  sessionId: string;

  @Column()
  postComments: string[];

  @Column()
  postGasUps: number;

  @Column()
  postGasUpMemberIds: string[];
}
