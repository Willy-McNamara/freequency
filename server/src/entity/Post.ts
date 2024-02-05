import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  postId: string;

  @Column()
  memberId: string;

  @Column()
  sessionId: string;

  @Column()
  postComments: string;

  @Column()
  postGasUps: number;

  @Column()
  postGasUpMemberIds: string;
}

/*
removing arrays so that I can test database connection.
need to figure out how to properly store arrays in postgres...
*/
