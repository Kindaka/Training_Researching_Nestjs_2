import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/user/entities/user.entity';
import { Post } from '../../modules/post/entities/post.entity';
import { Category } from '../../modules/category/entities/category.entity';
import { Tag } from '../../modules/tag/entities/tag.entity';
import { Comment } from '../../modules/comment/entities/comment.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 35432,
    username: "postgres", // thay đổi theo config của bạn
    password: "123456", // thay đổi theo config của bạn
    database: "postgres", // thay đổi theo config của bạn
    entities: [User, Post, Category, Tag, Comment],
    synchronize: false,
});

async function main() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const userRepository = AppDataSource.getRepository(User);
        const postRepository = AppDataSource.getRepository(Post);
        const categoryRepository = AppDataSource.getRepository(Category);
        const tagRepository = AppDataSource.getRepository(Tag);

        // Create categories
        const categories = await categoryRepository.save([
            {
                name: 'Technology',
                slug: 'technology',
                description: 'Posts about technology'
            },
            {
                name: 'Lifestyle',
                slug: 'lifestyle',
                description: 'Posts about lifestyle'
            },
            {
                name: 'Programming',
                slug: 'programming',
                description: 'Posts about programming'
            }
        ]);
        console.log('Categories seeded');

        // Create tags
        const tags = await tagRepository.save([
            {
                name: 'JavaScript',
                slug: 'javascript'
            },
            {
                name: 'TypeScript',
                slug: 'typescript'
            },
            {
                name: 'Web Development',
                slug: 'web-development'
            },
            {
                name: 'NodeJS',
                slug: 'nodejs'
            }
        ]);
        console.log('Tags seeded');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await userRepository.save({
            email: 'admin@example.com',
            fullName: 'Admin User',
            password: adminPassword,
            role: UserRole.ADMIN
        });
        //Create mod user
        const modPassword = await bcrypt.hash('mod123', 10);
        const mod = await userRepository.save({
            email: 'mod@example.com',
            fullName: 'Mod User',
            password: modPassword,
            role: UserRole.MOD
        });
        // Create regular users
        const userPassword = await bcrypt.hash('user123', 10);
        const users = await userRepository.save([
            {
                email: 'user1@example.com',
                fullName: 'User One',
                password: userPassword,
                role: UserRole.USER
            },
            {
                email: 'user2@example.com',
                fullName: 'User Two',
                password: userPassword,
                role: UserRole.USER
            }
        ]);
        console.log('Users seeded');

        // Create sample posts
        await postRepository.save([
            {
                title: 'Getting Started with TypeScript',
                content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript...',
                author: admin,
                published: true,
                publishedAt: new Date(),
                slug: 'getting-started-with-typescript',
                viewCount: 100,
                categories: [categories[0], categories[2]], // Technology, Programming
                tags: [tags[1], tags[2]] // TypeScript, Web Development
            },
            {
                title: 'Getting Started with TypeScript (Mod)',
                content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript...',
                author: mod,
                published: true,
                publishedAt: new Date(),
                slug: 'getting-started-with-typescript-mod',
                viewCount: 100,
                categories: [categories[0], categories[2]], // Technology, Programming
                tags: [tags[1], tags[2]] // TypeScript, Web Development
            },
            {
                title: 'Building a Blog with Node.js',
                content: 'In this tutorial, we will build a blog using Node.js and TypeScript...',
                author: users[0],
                published: true,
                publishedAt: new Date(),
                slug: 'building-blog-with-nodejs',
                viewCount: 75,
                categories: [categories[2]], // Programming
                tags: [tags[3], tags[2]] // NodeJS, Web Development
            },
            {
                title: 'Web Development Best Practices',
                content: 'Here are some best practices to follow in web development...',
                author: admin,
                published: true,
                publishedAt: new Date(),
                slug: 'web-development-best-practices',
                viewCount: 150,
                categories: [categories[0], categories[2]], // Technology, Programming
                tags: [tags[0], tags[2]] // JavaScript, Web Development
            },
            {
                title: 'Draft Post',
                content: 'This is a draft post that is not published yet...',
                author: users[1],
                published: false,
                slug: 'draft-post',
                viewCount: 0,
                categories: [categories[1]], // Lifestyle
                tags: []
            }
        ]);
        console.log('Posts seeded');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

main(); 