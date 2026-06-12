import { z } from "zod";
import { eq, desc, count, gte, sql } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, services, testimonials, faqs, siteConfig, users, jobOpenings, jobApplications, leads, portfolio, posts, partners, stockMovements, visits, tasks, auditLogs } from "@db/schema";
import { hashPassword } from "./lib/password";
import { audit } from "./lib/audit";

export const adminRouter = createRouter({
  // ========== PRODUCTS CRUD ==========
  products: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(products).orderBy(products.sortOrder);
    }),

    getById: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getDb()
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);
        return result[0] ?? null;
      }),

    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          image: z.string().optional(),
          price: z.string().or(z.number()),
          oldPrice: z.string().or(z.number()).optional(),
          unit: z.string().default("un"),
          badge: z.string().optional(),
          badgeColor: z.string().optional(),
          badgeTextColor: z.string().optional(),
          sortOrder: z.number().default(0),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const data = {
          ...input,
          price: input.price.toString(),
          oldPrice: input.oldPrice ? input.oldPrice.toString() : null,
        };
        const result = await getDb().insert(products).values(data);
        return { id: Number(result[0].insertId), ...data };
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          price: z.string().or(z.number()).optional(),
          oldPrice: z.string().or(z.number()).optional().nullable(),
          unit: z.string().optional(),
          badge: z.string().optional().nullable(),
          badgeColor: z.string().optional(),
          badgeTextColor: z.string().optional(),
          sortOrder: z.number().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(data)) {
          if (val !== undefined) updateData[key] = val;
        }
        if (updateData.price) updateData.price = updateData.price.toString();
        if (updateData.oldPrice === undefined) delete updateData.oldPrice;
        else if (updateData.oldPrice) updateData.oldPrice = (updateData.oldPrice as string | number).toString();
        else updateData.oldPrice = null;

        await getDb()
          .update(products)
          .set(updateData)
          .where(eq(products.id, id));
        return { id, ...updateData };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(products).where(eq(products.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(
          input.ids.map((id, index) =>
            db.update(products).set({ sortOrder: index }).where(eq(products.id, id))
          )
        );
        return { success: true };
      }),
  }),

  // ========== SERVICES CRUD ==========
  services: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(services).orderBy(services.sortOrder);
    }),

    getById: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getDb()
          .select()
          .from(services)
          .where(eq(services.id, input.id))
          .limit(1);
        return result[0] ?? null;
      }),

    create: adminQuery
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          image: z.string().optional(),
          icon: z.string().default("Home"),
          sortOrder: z.number().default(0),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const result = await getDb().insert(services).values(input);
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional().nullable(),
          image: z.string().optional().nullable(),
          icon: z.string().optional(),
          sortOrder: z.number().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(services).set(data).where(eq(services.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(services).where(eq(services.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(
          input.ids.map((id, index) =>
            db.update(services).set({ sortOrder: index }).where(eq(services.id, id))
          )
        );
        return { success: true };
      }),
  }),

  // ========== TESTIMONIALS CRUD ==========
  testimonials: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(testimonials).orderBy(testimonials.sortOrder);
    }),

    getById: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getDb()
          .select()
          .from(testimonials)
          .where(eq(testimonials.id, input.id))
          .limit(1);
        return result[0] ?? null;
      }),

    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1),
          location: z.string().optional(),
          text: z.string().min(1),
          image: z.string().optional(),
          rating: z.number().min(1).max(5).default(5),
          sortOrder: z.number().default(0),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const result = await getDb().insert(testimonials).values(input);
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          location: z.string().optional().nullable(),
          text: z.string().min(1).optional(),
          image: z.string().optional().nullable(),
          rating: z.number().min(1).max(5).optional(),
          sortOrder: z.number().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(testimonials).set(data).where(eq(testimonials.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(testimonials).where(eq(testimonials.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(
          input.ids.map((id, index) =>
            db.update(testimonials).set({ sortOrder: index }).where(eq(testimonials.id, id))
          )
        );
        return { success: true };
      }),
  }),

  // ========== FAQS CRUD ==========
  faqs: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(faqs).orderBy(faqs.sortOrder);
    }),

    getById: publicQuery
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getDb()
          .select()
          .from(faqs)
          .where(eq(faqs.id, input.id))
          .limit(1);
        return result[0] ?? null;
      }),

    create: adminQuery
      .input(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
          sortOrder: z.number().default(0),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const result = await getDb().insert(faqs).values(input);
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          question: z.string().min(1).optional(),
          answer: z.string().min(1).optional(),
          sortOrder: z.number().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(faqs).set(data).where(eq(faqs.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(faqs).where(eq(faqs.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(
          input.ids.map((id, index) =>
            db.update(faqs).set({ sortOrder: index }).where(eq(faqs.id, id))
          )
        );
        return { success: true };
      }),
  }),

  // ========== JOB OPENINGS CRUD ==========
  jobOpenings: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(jobOpenings).orderBy(jobOpenings.sortOrder);
    }),

    create: adminQuery
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          requirements: z.string().optional(),
          location: z.string().optional(),
          type: z.string().default("CLT"),
          sortOrder: z.number().default(0),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const result = await getDb().insert(jobOpenings).values(input);
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional().nullable(),
          requirements: z.string().optional().nullable(),
          location: z.string().optional().nullable(),
          type: z.string().optional(),
          sortOrder: z.number().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(jobOpenings).set(data).where(eq(jobOpenings.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(jobOpenings).where(eq(jobOpenings.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(
          input.ids.map((id, index) =>
            db.update(jobOpenings).set({ sortOrder: index }).where(eq(jobOpenings.id, id))
          )
        );
        return { success: true };
      }),
  }),

  // ========== JOB APPLICATIONS ==========
  jobApplications: createRouter({
    submit: publicQuery
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          area: z.string().min(1),
          experience: z.string().min(1),
          availability: z.string().min(1),
          hasCnh: z.boolean().default(false),
          hasVehicle: z.boolean().default(false),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await getDb().insert(jobApplications).values(input);
        return { success: true };
      }),

    list: adminQuery.query(async () => {
      return getDb()
        .select()
        .from(jobApplications)
        .orderBy(desc(jobApplications.createdAt));
    }),

    markRead: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().update(jobApplications).set({ read: true }).where(eq(jobApplications.id, input.id));
        return { success: true };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(jobApplications).where(eq(jobApplications.id, input.id));
        return { success: true };
      }),
  }),

  // ========== STOCK ==========
  stock: createRouter({
    summary: adminQuery.query(async () => {
      const db = getDb();
      const items = await db.select({
        id: products.id,
        name: products.name,
        unit: products.unit,
        quantity: products.quantity,
        minStock: products.minStock,
        active: products.active,
      }).from(products).orderBy(products.name);
      return items.map((p) => ({
        ...p,
        status: p.quantity === 0 ? "zerado" : p.quantity <= p.minStock ? "baixo" : "ok",
      }));
    }),

    listMovements: adminQuery
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return getDb()
          .select()
          .from(stockMovements)
          .where(eq(stockMovements.productId, input.productId))
          .orderBy(desc(stockMovements.createdAt))
          .limit(50);
      }),

    addMovement: adminQuery
      .input(z.object({
        productId: z.number(),
        type: z.enum(["entrada", "saída", "ajuste", "perda"]),
        quantity: z.number().int().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const [product] = await db.select({ quantity: products.quantity })
          .from(products).where(eq(products.id, input.productId)).limit(1);
        if (!product) throw new Error("Produto não encontrado.");

        const delta = input.type === "entrada"
          ? input.quantity
          : -input.quantity;

        const newQty = Math.max(0, product.quantity + delta);
        await db.update(products).set({ quantity: newQty }).where(eq(products.id, input.productId));
        await db.insert(stockMovements).values({
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          notes: input.notes,
        });
        return { success: true, newQuantity: newQty };
      }),

    setMinStock: adminQuery
      .input(z.object({ productId: z.number(), minStock: z.number().int().min(0) }))
      .mutation(async ({ input }) => {
        await getDb().update(products).set({ minStock: input.minStock }).where(eq(products.id, input.productId));
        return { success: true };
      }),

    alerts: adminQuery.query(async () => {
      const items = await getDb().select({
        id: products.id,
        name: products.name,
        unit: products.unit,
        quantity: products.quantity,
        minStock: products.minStock,
      }).from(products).where(eq(products.active, true));
      return items
        .filter((p) => p.minStock > 0 && p.quantity <= p.minStock)
        .map((p) => ({ ...p, status: p.quantity === 0 ? "zerado" : "baixo" }));
    }),
  }),

  // ========== LEADS ==========
  leads: createRouter({
    submit: publicQuery
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        service: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await getDb().insert(leads).values({ ...input, email: input.email || null });
        return { success: true };
      }),

    list: adminQuery.query(async () => {
      return getDb().select().from(leads).orderBy(desc(leads.createdAt));
    }),

    updateStatus: adminQuery
      .input(z.object({ id: z.number(), status: z.enum(["novo", "em_contato", "orcamento_enviado", "fechado", "perdido"]) }))
      .mutation(async ({ input }) => {
        await getDb().update(leads).set({ status: input.status, read: true }).where(eq(leads.id, input.id));
        return { success: true };
      }),

    updateNotes: adminQuery
      .input(z.object({ id: z.number(), notes: z.string(), value: z.string().optional() }))
      .mutation(async ({ input }) => {
        await getDb().update(leads).set({ notes: input.notes, value: input.value ?? null, read: true }).where(eq(leads.id, input.id));
        return { success: true };
      }),

    markRead: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().update(leads).set({ read: true }).where(eq(leads.id, input.id));
        return { success: true };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(leads).where(eq(leads.id, input.id));
        return { success: true };
      }),
  }),

  // ========== PORTFOLIO ==========
  portfolio: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(portfolio).orderBy(portfolio.sortOrder);
    }),

    create: adminQuery
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().default("Geral"),
        image: z.string().min(1),
        sortOrder: z.number().default(0),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const result = await getDb().insert(portfolio).values(input);
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        category: z.string().optional(),
        image: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(portfolio).set(data).where(eq(portfolio.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(portfolio).where(eq(portfolio.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(input.ids.map((id, index) =>
          db.update(portfolio).set({ sortOrder: index }).where(eq(portfolio.id, id))
        ));
        return { success: true };
      }),
  }),

  // ========== POSTS (BLOG) ==========
  posts: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(posts).orderBy(desc(posts.publishedAt));
    }),

    getBySlug: publicQuery
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const result = await getDb().select().from(posts).where(eq(posts.slug, input.slug)).limit(1);
        return result[0] ?? null;
      }),

    create: adminQuery
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        image: z.string().optional(),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const result = await getDb().insert(posts).values({ ...input, publishedAt: new Date() });
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional().nullable(),
        content: z.string().optional(),
        image: z.string().optional().nullable(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(posts).set(data).where(eq(posts.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(posts).where(eq(posts.id, input.id));
        return { success: true };
      }),
  }),

  // ========== PARTNERS ==========
  partners: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(partners).orderBy(partners.sortOrder);
    }),

    create: adminQuery
      .input(z.object({
        name: z.string().min(1),
        logo: z.string().min(1),
        url: z.string().url("URL inválida").optional().or(z.literal("")),
        sortOrder: z.number().default(0),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const result = await getDb().insert(partners).values(input);
        return { id: Number(result[0].insertId), ...input };
      }),

    update: adminQuery
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        logo: z.string().optional(),
        url: z.string().url("URL inválida").optional().nullable().or(z.literal("")).or(z.null()),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await getDb().update(partners).set(data).where(eq(partners.id, id));
        return { id, ...data };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(partners).where(eq(partners.id, input.id));
        return { success: true };
      }),

    reorder: adminQuery
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await Promise.all(input.ids.map((id, index) =>
          db.update(partners).set({ sortOrder: index }).where(eq(partners.id, id))
        ));
        return { success: true };
      }),
  }),

  // ========== TASKS ==========
  tasks: createRouter({
    list: adminQuery.query(async () => {
      const now = new Date();
      const rows = await getDb().select().from(tasks).orderBy(tasks.deadline);
      return rows.map((t) => ({
        ...t,
        isOverdue:
          t.status !== "concluida" &&
          t.status !== "cancelada" &&
          new Date(t.deadline) < now,
      }));
    }),

    create: adminQuery
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        assignee: z.string().min(1),
        phone: z.string().optional(),
        deadline: z.string(),
        priority: z.enum(["baixa", "media", "alta", "urgente"]).default("media"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await getDb().insert(tasks).values({
          ...input,
          deadline: new Date(input.deadline),
        });
        return { id: Number(result[0].insertId) };
      }),

    update: adminQuery
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        assignee: z.string().optional(),
        phone: z.string().optional().nullable(),
        deadline: z.string().optional(),
        priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
        status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]).optional(),
        notes: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { id, deadline, status, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (deadline) data.deadline = new Date(deadline);
        if (status) {
          data.status = status;
          if (status === "concluida") data.completedAt = new Date();
          else data.completedAt = null;
        }
        await getDb().update(tasks).set(data).where(eq(tasks.id, id));
        return { success: true };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(tasks).where(eq(tasks.id, input.id));
        return { success: true };
      }),

    overdueCount: adminQuery.query(async () => {
      const now = new Date();
      const rows = await getDb().select({ status: tasks.status, deadline: tasks.deadline }).from(tasks);
      const overdue = rows.filter(
        (t) => t.status !== "concluida" && t.status !== "cancelada" && new Date(t.deadline) < now
      );
      return { count: overdue.length };
    }),
  }),

  // ========== VISITS (AGENDA) ==========
  visits: createRouter({
    list: adminQuery.query(async () => {
      return getDb().select().from(visits).orderBy(visits.scheduledAt);
    }),

    create: adminQuery
      .input(z.object({
        leadId: z.number().optional(),
        title: z.string().min(1),
        scheduledAt: z.string(),
        address: z.string().optional(),
        contact: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["agendada", "realizada", "cancelada"]).default("agendada"),
      }))
      .mutation(async ({ input }) => {
        const result = await getDb().insert(visits).values({
          ...input,
          scheduledAt: new Date(input.scheduledAt),
        });
        return { id: Number(result[0].insertId) };
      }),

    update: adminQuery
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        scheduledAt: z.string().optional(),
        address: z.string().optional().nullable(),
        contact: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        status: z.enum(["agendada", "realizada", "cancelada"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, scheduledAt, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
        await getDb().update(visits).set(data).where(eq(visits.id, id));
        return { success: true };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await getDb().delete(visits).where(eq(visits.id, input.id));
        return { success: true };
      }),
  }),

  // ========== SITE CONFIG CRUD ==========
  config: createRouter({
    list: publicQuery.query(async () => {
      return getDb().select().from(siteConfig);
    }),

    getByKey: publicQuery
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const result = await getDb()
          .select()
          .from(siteConfig)
          .where(eq(siteConfig.key, input.key))
          .limit(1);
        return result[0] ?? null;
      }),

    set: adminQuery
      .input(
        z.object({
          key: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await getDb()
          .select()
          .from(siteConfig)
          .where(eq(siteConfig.key, input.key))
          .limit(1);

        if (existing.length > 0) {
          await getDb()
            .update(siteConfig)
            .set({ value: input.value })
            .where(eq(siteConfig.key, input.key));
        } else {
          await getDb().insert(siteConfig).values(input);
        }
        return { key: input.key, value: input.value };
      }),

    delete: adminQuery
      .input(z.object({ key: z.string() }))
      .mutation(async ({ input }) => {
        await getDb().delete(siteConfig).where(eq(siteConfig.key, input.key));
        return { success: true };
      }),
  }),

  // ========== USERS MANAGEMENT ==========
  users: createRouter({
    list: adminQuery.query(async () => {
      return getDb()
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatar: users.avatar,
          createdAt: users.createdAt,
          lastSignInAt: users.lastSignInAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));
    }),

    setRole: adminQuery
      .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        if (input.id === ctx.user.id) throw new Error("Você não pode alterar seu próprio papel.");
        const [target] = await getDb().select({ role: users.role, email: users.email }).from(users).where(eq(users.id, input.id)).limit(1);
        if (target?.role === "super_admin") throw new Error("O papel do super administrador não pode ser alterado.");
        await getDb().update(users).set({ role: input.role }).where(eq(users.id, input.id));
        audit({ action: "user.setRole", entity: "users", entityId: input.id, detail: `role → ${input.role} (era: ${target?.role}) sobre ${target?.email}`, userId: ctx.user.id, userEmail: ctx.user.email ?? undefined });
        return { success: true };
      }),

    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["user", "admin"]).default("admin"),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await getDb()
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (existing.length > 0) throw new Error("Já existe um usuário com esse e-mail.");
        const passwordHash = await hashPassword(input.password);
        const unionId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const result = await getDb().insert(users).values({
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role,
          unionId,
        });
        return { id: Number(result[0].insertId) };
      }),

    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (input.id === ctx.user.id) throw new Error("Você não pode excluir sua própria conta.");
        const [target] = await getDb().select({ role: users.role, email: users.email }).from(users).where(eq(users.id, input.id)).limit(1);
        if (target?.role === "super_admin") throw new Error("O super administrador não pode ser excluído.");
        await getDb().delete(users).where(eq(users.id, input.id));
        audit({ action: "user.delete", entity: "users", entityId: input.id, detail: `excluiu ${target?.email}`, userId: ctx.user.id, userEmail: ctx.user.email ?? undefined });
        return { success: true };
      }),
  }),

  // ========== AUDIT LOGS ==========
  auditLogs: createRouter({
    list: adminQuery
      .input(z.object({ limit: z.number().int().min(1).max(200).default(100) }))
      .query(async ({ input }) => {
        return getDb()
          .select()
          .from(auditLogs)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit);
      }),
  }),

  // ========== NOTIFICATIONS ==========
  notifications: createRouter({
    unread: adminQuery.query(async () => {
      const db = getDb();
      const now = new Date();
      const [
        [unreadLeads], [unreadApps],
        recentLeads, recentApps, upcomingVisits, allTasks,
      ] = await Promise.all([
        db.select({ total: count() }).from(leads).where(eq(leads.read, false)),
        db.select({ total: count() }).from(jobApplications).where(eq(jobApplications.read, false)),
        db.select({ id: leads.id, name: leads.name, service: leads.service, createdAt: leads.createdAt })
          .from(leads).where(eq(leads.read, false)).orderBy(desc(leads.createdAt)).limit(5),
        db.select({ id: jobApplications.id, name: jobApplications.name, area: jobApplications.area, createdAt: jobApplications.createdAt })
          .from(jobApplications).where(eq(jobApplications.read, false)).orderBy(desc(jobApplications.createdAt)).limit(5),
        db.select({ id: visits.id, title: visits.title, scheduledAt: visits.scheduledAt })
          .from(visits).where(eq(visits.status, "agendada")).orderBy(visits.scheduledAt).limit(3),
        db.select({ id: tasks.id, title: tasks.title, assignee: tasks.assignee, deadline: tasks.deadline, status: tasks.status })
          .from(tasks).orderBy(tasks.deadline),
      ]);

      const overdueTasks = allTasks.filter(
        (t) => t.status !== "concluida" && t.status !== "cancelada" && new Date(t.deadline) < now
      ).slice(0, 5);

      const leadsCount = Number(unreadLeads?.total ?? 0);
      const appsCount = Number(unreadApps?.total ?? 0);

      return {
        unreadLeads: leadsCount,
        unreadApps: appsCount,
        overdueTasks: overdueTasks.length,
        total: leadsCount + appsCount + overdueTasks.length,
        recentLeads,
        recentApps,
        upcomingVisits,
        overdueTasks,
      };
    }),
  }),

  // ========== DASHBOARD STATS ==========
  stats: createRouter({
    leadsHistory: adminQuery.query(async () => {
      const db = getDb();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const rows = await db.select({
        month: sql<string>`DATE_FORMAT(${leads.createdAt}, '%Y-%m')`,
        total: count(),
      })
        .from(leads)
        .where(gte(leads.createdAt, sixMonthsAgo))
        .groupBy(sql`DATE_FORMAT(${leads.createdAt}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${leads.createdAt}, '%Y-%m')`);

      const statusRows = await db.select({
        status: leads.status,
        total: count(),
      }).from(leads).groupBy(leads.status);

      return { monthly: rows, byStatus: statusRows };
    }),

    dashboard: adminQuery.query(async () => {
      const db = getDb();

      const [[productTotal], [productActive]] = await Promise.all([
        db.select({ total: count() }).from(products),
        db.select({ total: count() }).from(products).where(eq(products.active, true)),
      ]);
      const [[serviceTotal], [serviceActive]] = await Promise.all([
        db.select({ total: count() }).from(services),
        db.select({ total: count() }).from(services).where(eq(services.active, true)),
      ]);
      const [[testimonialTotal], [testimonialActive]] = await Promise.all([
        db.select({ total: count() }).from(testimonials),
        db.select({ total: count() }).from(testimonials).where(eq(testimonials.active, true)),
      ]);
      const [[faqTotal], [faqActive]] = await Promise.all([
        db.select({ total: count() }).from(faqs),
        db.select({ total: count() }).from(faqs).where(eq(faqs.active, true)),
      ]);
      const [[jobTotal], [jobActive]] = await Promise.all([
        db.select({ total: count() }).from(jobOpenings),
        db.select({ total: count() }).from(jobOpenings).where(eq(jobOpenings.active, true)),
      ]);

      const [[applicationTotal], [applicationUnread]] = await Promise.all([
        db.select({ total: count() }).from(jobApplications),
        db.select({ total: count() }).from(jobApplications).where(eq(jobApplications.read, false)),
      ]);
      const [[leadTotal], [leadUnread]] = await Promise.all([
        db.select({ total: count() }).from(leads),
        db.select({ total: count() }).from(leads).where(eq(leads.read, false)),
      ]);
      const [[postTotal], [postActive]] = await Promise.all([
        db.select({ total: count() }).from(posts),
        db.select({ total: count() }).from(posts).where(eq(posts.active, true)),
      ]);
      const [[portfolioTotal], [portfolioActive]] = await Promise.all([
        db.select({ total: count() }).from(portfolio),
        db.select({ total: count() }).from(portfolio).where(eq(portfolio.active, true)),
      ]);

      const [recentProducts, recentServices, recentTestimonials, recentFaqs, recentJobs] = await Promise.all([
        db.select({ id: products.id, label: products.name, updatedAt: products.updatedAt })
          .from(products).orderBy(desc(products.updatedAt)).limit(3),
        db.select({ id: services.id, label: services.title, updatedAt: services.updatedAt })
          .from(services).orderBy(desc(services.updatedAt)).limit(3),
        db.select({ id: testimonials.id, label: testimonials.name, updatedAt: testimonials.updatedAt })
          .from(testimonials).orderBy(desc(testimonials.updatedAt)).limit(3),
        db.select({ id: faqs.id, label: faqs.question, updatedAt: faqs.updatedAt })
          .from(faqs).orderBy(desc(faqs.updatedAt)).limit(3),
        db.select({ id: jobOpenings.id, label: jobOpenings.title, updatedAt: jobOpenings.updatedAt })
          .from(jobOpenings).orderBy(desc(jobOpenings.updatedAt)).limit(3),
      ]);

      const recentActivity = [
        ...recentProducts.map((r) => ({ ...r, type: "Produto" as const })),
        ...recentServices.map((r) => ({ ...r, type: "Serviço" as const })),
        ...recentTestimonials.map((r) => ({ ...r, type: "Depoimento" as const })),
        ...recentFaqs.map((r) => ({ ...r, type: "FAQ" as const })),
        ...recentJobs.map((r) => ({ ...r, type: "Vaga" as const })),
      ]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8);

      return {
        products: { total: Number(productTotal?.total ?? 0), active: Number(productActive?.total ?? 0) },
        services: { total: Number(serviceTotal?.total ?? 0), active: Number(serviceActive?.total ?? 0) },
        testimonials: { total: Number(testimonialTotal?.total ?? 0), active: Number(testimonialActive?.total ?? 0) },
        faqs: { total: Number(faqTotal?.total ?? 0), active: Number(faqActive?.total ?? 0) },
        jobOpenings: { total: Number(jobTotal?.total ?? 0), active: Number(jobActive?.total ?? 0) },
        jobApplications: { total: Number(applicationTotal?.total ?? 0), unread: Number(applicationUnread?.total ?? 0) },
        leads: { total: Number(leadTotal?.total ?? 0), unread: Number(leadUnread?.total ?? 0) },
        posts: { total: Number(postTotal?.total ?? 0), active: Number(postActive?.total ?? 0) },
        portfolio: { total: Number(portfolioTotal?.total ?? 0), active: Number(portfolioActive?.total ?? 0) },
        recentActivity,
      };
    }),
  }),
});
