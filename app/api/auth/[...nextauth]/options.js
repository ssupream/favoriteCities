import bcrypt from "bcrypt";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { AppDataSource } from "@/app/database/data-source";
import { User } from "@/app/entity/User";

export const options = {
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile: (profile) => {
        return {
          id: profile.id,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "User Name",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Type here...",
        },
      },
      authorize: async (credentials) => {
        try {
          await AppDataSource.initialize();

          const userRepo = AppDataSource.getRepository(User);

          const user = await userRepo.findOne({
            where: { username: credentials?.username },
          });

          if (!user) {
            throw new Error("Invalid username or password");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials?.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid username or password");
          }

          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            id: user.id,
            name: user.username,
            email: user.email,
            image: user.profileImage || "",
          };
        } catch (error) {
          console.error("Authorization error:", error.message);
          throw new Error("Invalid username or password");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name || token.username,
          email: token.email,
          image: token.image || "",
        };
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name || user.username;
        token.email = user.email;
        token.image = user.image || "";
      }
      return token;
    },
  },
};
