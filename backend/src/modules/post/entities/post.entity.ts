import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "../../user/entities/user.entity"
import { Category } from "../../category/entities/category.entity"
import { Tag } from "../../tag/entities/tag.entity"
import { Comment } from "../../comment/entities/comment.entity"

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column('text')
    content: string

    @Column({ unique: true })
    slug: string

    @Column({ default: false })
    published: boolean

    @Column({ default: 0 })
    viewCount: number

    @Column({ nullable: true })
    publishedAt: Date

    @Column({ nullable: true })
    image: string

    @Column({ nullable: true })
    video: string

    @ManyToOne(() => User, user => user.posts)
    author: User

    @ManyToMany(() => Category)
    @JoinTable({
        name: "post_categories",
        joinColumn: { name: "postId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "categoryId", referencedColumnName: "id" }
    })
    categories: Category[]

    @ManyToMany(() => Tag)
    @JoinTable({
        name: "post_tags",
        joinColumn: { name: "postId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "tagId", referencedColumnName: "id" }
    })
    tags: Tag[]

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
} 