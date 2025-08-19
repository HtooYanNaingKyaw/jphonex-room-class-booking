import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

export const policiesRouter = Router();

// Get all policies with pagination
policiesRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive = req.query.is_active as string;

    const where: any = {};
    
    if (isActive !== undefined) {
      where.is_active = isActive === 'true';
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.policy.count({ where }),
    ]);

    res.json({
      policies: policies.map(policy => ({
        id: policy.id.toString(),
        title: policy.title,
        body: policy.body,
        is_active: policy.is_active,
        created_at: policy.created_at,
        updated_at: policy.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get active policies (for public access)
policiesRouter.get('/active', async (req, res) => {
  try {
    const policies = await prisma.policy.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });

    res.json(policies.map(policy => ({
      id: policy.id.toString(),
      title: policy.title,
      body: policy.body,
      is_active: policy.is_active,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
    })));
  } catch (error) {
    console.error('Get active policies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get policy by ID
policiesRouter.get('/:id', async (req, res) => {
  try {
    const policyId = BigInt(req.params.id);
    
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json({
      id: policy.id.toString(),
      title: policy.title,
      body: policy.body,
      is_active: policy.is_active,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
    });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new policy
policiesRouter.post('/', async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    is_active: z.boolean().default(true),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { title, body, is_active } = parsed.data;
    
    const policy = await prisma.policy.create({
      data: {
        title,
        body,
        is_active,
      },
    });

    res.status(201).json({
      id: policy.id.toString(),
      title: policy.title,
      body: policy.body,
      is_active: policy.is_active,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
    });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update policy
policiesRouter.put('/:id', async (req, res) => {
  const schema = z.object({
    title: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    is_active: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const policyId = BigInt(req.params.id);
    
    const policy = await prisma.policy.update({
      where: { id: policyId },
      data: parsed.data,
    });

    res.json({
      id: policy.id.toString(),
      title: policy.title,
      body: policy.body,
      is_active: policy.is_active,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
    });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete policy
policiesRouter.delete('/:id', async (req, res) => {
  try {
    const policyId = BigInt(req.params.id);
    
    await prisma.policy.delete({
      where: { id: policyId },
    });

    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle policy status
policiesRouter.patch('/:id/toggle', async (req, res) => {
  try {
    const policyId = BigInt(req.params.id);
    
    const currentPolicy = await prisma.policy.findUnique({
      where: { id: policyId },
    });

    if (!currentPolicy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    const policy = await prisma.policy.update({
      where: { id: policyId },
      data: { is_active: !currentPolicy.is_active },
    });

    res.json({
      id: policy.id.toString(),
      title: policy.title,
      body: policy.body,
      is_active: policy.is_active,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
    });
  } catch (error) {
    console.error('Toggle policy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
