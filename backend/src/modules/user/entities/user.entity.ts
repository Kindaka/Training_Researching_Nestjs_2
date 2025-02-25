import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Post } from "../../post/entities/post.entity"
import { Comment } from "../../comment/entities/comment.entity"

export enum UserRole {
    ADMIN = "ADMIN",
    MOD = "MOD",
    USER = "USER"
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    email: string

    @Column()
    fullName: string

    @Column()
    password: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole

    @OneToMany(() => Post, post => post.author)
    posts: Post[]

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
} 