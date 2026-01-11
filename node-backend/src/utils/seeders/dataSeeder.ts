/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { userDocumentsRepository } from "../../repositories/user.documents.repository.js";
import { userChatbotsRepository } from "../../repositories/user.chatbots.repository.js";
import { userConversationsRepository } from "../../repositories/user.conversations.repository.js";
import { adminUsersRepository } from "../../repositories/admin.users.repository.js";
import Document from "../../models/Document.js";
import ChatBot, { ChatbotVisibilityEnum } from "../../models/ChatBot.js";
import Conversation from "../../models/Conversation.js";
import logger from "../logger/index.js";

interface SeederResult {
  documentIds: string[];
  chatbotIds: string[];
  conversationIds: string[];
}

const DOCUMENT_TOPICS = [
  "Machine Learning",
  "Web Development",
  "Database Design",
  "Cloud Computing",
  "Cybersecurity",
  "Mobile Development",
  "DevOps",
  "AI Ethics",
  "Data Science",
  "Blockchain",
  "IoT",
  "Quantum Computing",
  "Software Architecture",
  "UX Design",
  "API Development",
  "Microservices",
  "Containerization",
  "CI/CD",
  "Testing",
  "Performance Optimization",
  "Code Review",
  "Agile Methodology",
  "Git Workflows",
  "System Design",
  "Network Security",
];

const CHATBOT_TYPES = [
  "Customer Support",
  "Technical Assistant",
  "Sales Helper",
  "Documentation Bot",
  "Code Review Bot",
  "Learning Assistant",
  "Project Manager",
  "HR Assistant",
  "Finance Advisor",
  "Legal Consultant",
  "Marketing Advisor",
  "Data Analyst",
  "Security Auditor",
  "Performance Monitor",
  "Bug Tracker",
  "Feature Suggester",
  "API Helper",
  "Database Admin",
  "DevOps Helper",
  "QA Assistant",
];

const USER_QUERIES = [
  "How do I implement authentication?",
  "What are the best practices for database design?",
  "Can you explain microservices architecture?",
  "Help me optimize this query",
  "What is the difference between REST and GraphQL?",
  "How to deploy to production?",
  "Explain containerization benefits",
  "What are design patterns?",
  "How to improve code quality?",
  "Best practices for API security",
  "How to handle errors in production?",
  "What is CI/CD pipeline?",
  "Explain test-driven development",
  "How to scale an application?",
  "What are the SOLID principles?",
];

class DataSeeder {
  private userId: string | null = null;

  async clearAll(): Promise<void> {
    logger.info("🧹 Clearing existing data...");

    // Clear in reverse dependency order
    await Conversation.deleteMany({});
    await ChatBot.deleteMany({});
    await Document.deleteMany({});
    await Document.deleteMany({});

    logger.info("✅ All data cleared");
  }

  async seedAll(count: number = 50): Promise<SeederResult> {
    logger.info(`🌱 Starting data seeding with ${count} items each...`);

    // Get or create a user for seeding
    await this.ensureUser();

    if (!this.userId) {
      throw new Error("Failed to get user for seeding");
    }

    // Seed in dependency order
    const documentIds = await this.seedDocuments(count);
    logger.info(`✅ Created ${documentIds.length} documents`);

    const chatbotIds = await this.seedChatbots(
      count,
      documentIds
    );
    logger.info(`✅ Created ${chatbotIds.length} chatbots`);

    const conversationIds = await this.seedConversations(count, chatbotIds);
    logger.info(`✅ Created ${conversationIds.length} conversations`);

    // Seed extra random users
    await this.seedUsers(count);

    return {
      documentIds,
      chatbotIds,
      conversationIds,
    };
  }

  private async seedUsers(count: number): Promise<void> {
    logger.info(`👥 Seeding ${count} random users...`);

    // We'll use the user repo or User model directly if needed, but let's stick to adminUsersRepository if possible
    // However, User model is imported so let's use it for simplicity in seeding
    // Need to import Role to assign default role if needed, or rely on pre-save hook
    // The pre-save hook in User model assigns 'user' role automatically if not provided.

    for (let i = 0; i < count; i++) {
      const firstName = `User${i + 1}`;
      const lastName = `Test`;
      const email = `user${i + 1}_${Date.now()}@example.com`;
      const password = "password123";

      try {
        await adminUsersRepository.create({
          firstName,
          lastName,
          email,
          password
        });
      } catch (error) {
        logger.error(`❌ Failed to create user ${email}:`, error);
      }

      if ((i + 1) % 10 === 0) {
        logger.info(`  📊 Progress: ${i + 1}/${count} users`);
      }
    }
    logger.info(`✅ Created ${count} random users`);
  }

  private async ensureUser(): Promise<void> {
    // Try to find an existing user
    const users = await adminUsersRepository.find({}, { limit: 1 });

    if (users.length > 0) {
      this.userId = (users[0]._id as mongoose.Types.ObjectId).toString();
      logger.info(`📝 Using existing user: ${users[0].email}`);
    } else {
      logger.info("⚠️  No users found! Creating a default user for seeding...");
      const email = `seed_user_${Date.now()}@example.com`;
      try {
        const user = await adminUsersRepository.create({
            firstName: "Seed",
            lastName: "User",
            email,
            password: "password123"
        });
        this.userId = (user._id as mongoose.Types.ObjectId).toString();
        logger.info(`✅ Created and using seed user: ${email}`);
      } catch (error) {
         logger.error("❌ Failed to create seed user:", error);
         throw error;
      }
    }
  }



  private async seedDocuments(count: number): Promise<string[]> {
    logger.info(`📄 Seeding ${count} documents...`);
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
      const topic = DOCUMENT_TOPICS[i % DOCUMENT_TOPICS.length];
      const content = this.generateDocumentContent(topic, i);

      const document = await userDocumentsRepository.create({
        name: `${topic} Documentation ${i + 1}`,
        description: `Comprehensive guide and documentation about ${topic}`,
        user_id: new mongoose.Types.ObjectId(this.userId!),
        content,
        content_preview: content.substring(0, 200),
        metadata: {
          status: "indexed",
          chunk_count: Math.floor(content.length / 500) + 1,
        },
      });

      ids.push((document._id as mongoose.Types.ObjectId).toString());

      if ((i + 1) % 10 === 0) {
        logger.info(`  📊 Progress: ${i + 1}/${count} documents`);
      }
    }

    return ids;
  }

  private async seedChatbots(
    count: number,
    documentIds: string[]
  ): Promise<string[]> {
    logger.info(`🤖 Seeding ${count} chatbots...`);
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
      const type = CHATBOT_TYPES[i % CHATBOT_TYPES.length];

      // Each chatbot gets 2-5 random documents
      const numDocs = 2 + (i % 4);
      const selectedDocs = this.selectRandomItems(documentIds, numDocs);

      const chatbot = await userChatbotsRepository.create({
        name: `${type} Bot ${i + 1}`,
        is_active: i % 5 !== 0, // 80% active
        visibility: i % 3 === 0 ? ChatbotVisibilityEnum.PUBLIC : ChatbotVisibilityEnum.PRIVATE,
        system_prompt: `You are a specialized ${type} assistant. Be helpful, professional, and concise.`,
        user_id: new mongoose.Types.ObjectId(this.userId!),
        document_ids: selectedDocs.map((id) => new mongoose.Types.ObjectId(id)),
        shared_with: [],
      });

      ids.push((chatbot._id as mongoose.Types.ObjectId).toString());

      if ((i + 1) % 10 === 0) {
        logger.info(`  📊 Progress: ${i + 1}/${count} chatbots`);
      }
    }

    return ids;
  }

  private async seedConversations(
    count: number,
    chatbotIds: string[]
  ): Promise<string[]> {
    logger.info(`💬 Seeding ${count} conversations...`);
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
      const chatbotId = chatbotIds[i % chatbotIds.length];

      // Each conversation gets 2-10 messages
      const numMessages = 2 + (i % 9);
      const messages = this.generateMessages(numMessages);

      const conversation = await userConversationsRepository.create({
        user_id: new mongoose.Types.ObjectId(this.userId!),
        chatbot_id: new mongoose.Types.ObjectId(chatbotId),
        title: `Conversation about ${USER_QUERIES[i % USER_QUERIES.length]}`,
        messages,
        last_message_at: messages[messages.length - 1].timestamp,
      });

      ids.push((conversation._id as mongoose.Types.ObjectId).toString());

      if ((i + 1) % 10 === 0) {
        logger.info(`  📊 Progress: ${i + 1}/${count} conversations`);
      }
    }

    return ids;
  }

  private generateDocumentContent(topic: string, index: number): string {
    return `# ${topic} Documentation

## Introduction
This comprehensive guide covers the essential concepts and best practices for ${topic.toLowerCase()}.
Document ID: ${index + 1}

## Key Concepts
Understanding ${topic.toLowerCase()} requires knowledge of several fundamental principles:

1. **Foundation**: The basic principles that govern ${topic.toLowerCase()}
2. **Implementation**: Practical approaches to applying these concepts
3. **Best Practices**: Industry-standard methods for optimal results
4. **Common Pitfalls**: Mistakes to avoid when working with ${topic.toLowerCase()}

## Advanced Topics
For those looking to deepen their understanding:

- Scalability considerations
- Performance optimization techniques
- Security best practices
- Integration patterns
- Monitoring and maintenance

## Examples
Here are some practical examples demonstrating ${topic.toLowerCase()} in action:

\`\`\`
Example code or configuration would go here
This is placeholder content for demonstration
\`\`\`

## Conclusion
Mastering ${topic.toLowerCase()} is crucial for modern software development.
This document provides a solid foundation for your learning journey.

## References
- Official documentation
- Community resources
- Related topics for further reading

---
*Last updated: ${new Date().toISOString()}*
*Document version: 1.${index}*
`;
  }

  private generateMessages(count: number): Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    sources?: any[];
  }> {
    const messages: Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
      sources?: any[];
    }> = [];
    const baseTime = new Date();

    for (let i = 0; i < count; i++) {
      // User message
      messages.push({
        role: "user" as const,
        content: USER_QUERIES[i % USER_QUERIES.length],
        timestamp: new Date(baseTime.getTime() + i * 60000), // 1 minute apart
      });

      // Assistant response
      if (i < count - 1 || count % 2 === 0) {
        messages.push({
          role: "assistant" as const,
          content: this.generateAssistantResponse(
            USER_QUERIES[i % USER_QUERIES.length]
          ),
          timestamp: new Date(baseTime.getTime() + i * 60000 + 30000), // 30 seconds after user
          sources:
            i % 3 === 0
              ? [{ content: "From documentation", metadata: {} }]
              : [],
        });
      }
    }

    return messages;
  }

  private generateAssistantResponse(query: string): string {
    return `I'd be happy to help you with "${query}".

Here's a comprehensive answer:

1. First, let's understand the context and requirements
2. Next, I'll provide step-by-step guidance
3. Finally, I'll share some best practices and common pitfalls to avoid

Based on the documentation and best practices, here's what you should know...

[This is a simulated response for seeding purposes. In production, this would be generated by the actual LLM.]

Is there anything specific about this topic you'd like me to clarify?`;
  }

  private selectRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }


}

export const dataSeeder = new DataSeeder();
