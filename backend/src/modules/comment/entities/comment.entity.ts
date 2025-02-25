import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm"
import { User } from "../../user/entities/user.entity"
import { Post } from "../../post/entities/post.entity"

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    content: string

    @ManyToOne(() => User, user => user.comments)
    user: User

    @ManyToOne(() => Post, post => post.comments)
    post: Post

    @ManyToOne(() => Comment, comment => comment.replies)
    @JoinColumn({ name: 'parent_id' })
    parent: Comment

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
} 