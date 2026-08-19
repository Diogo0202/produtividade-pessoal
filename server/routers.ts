import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const explanationInput = z.object({
  eventType: z.string().min(2).max(80),
  city: z.string().min(2).max(120),
  level: z.enum(["leigo", "técnico", "acadêmico"]),
  formation: z.string().min(10).max(1800),
  impacts: z.array(z.string().min(2).max(220)).max(6),
  mitigation: z.array(z.string().min(2).max(220)).max(6),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  education: router({
    adaptExplanation: publicProcedure.input(explanationInput).mutation(async ({ input }) => {
      const style = input.level === "leigo" ? "linguagem cotidiana, frases curtas e um exemplo simples" : input.level === "técnico" ? "vocabulário de meteorologia escolar, com conceitos definidos em contexto" : "linguagem acadêmica, relações causais, limites da previsão e questões para debate";
      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "Você é um educador em meteorologia. Produza conteúdo em português do Brasil, preciso, cauteloso e adequado ao contexto escolar. Não faça previsões novas nem substitua órgãos de emergência." },
          { role: "user", content: `Adapte uma explicação sobre ${input.eventType} em ${input.city} para nível ${input.level}. Use ${style}. Contexto de formação: ${input.formation}. Impactos: ${input.impacts.join("; ")}. Medidas de redução de risco: ${input.mitigation.join("; ")}. Retorne dois parágrafos e três perguntas de discussão em uma lista curta.` },
        ],
        maxTokens: 700,
      });
      const content = response.choices[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new Error("A IA não retornou uma explicação utilizável.");
      return { content, model: "gpt-5-mini" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
