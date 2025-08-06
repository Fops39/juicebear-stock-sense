-- Add more diverse products to the database
INSERT INTO public.products (name, category, description, sku, unit_price) VALUES
-- Dairy Products
('Whole Milk 1L', 'dairy', 'Fresh whole milk 1 liter', 'WM-1L-001', 2.99),
('Greek Yogurt 500g', 'dairy', 'Natural Greek yogurt 500g', 'GY-500-001', 4.49),
('Cheddar Cheese 200g', 'dairy', 'Aged cheddar cheese block 200g', 'CC-200-001', 5.99),
('Butter 250g', 'dairy', 'Unsalted butter 250g', 'BT-250-001', 3.79),

-- Snacks
('Potato Chips Original 150g', 'snacks', 'Classic potato chips 150g bag', 'PC-150-001', 2.49),
('Mixed Nuts 200g', 'snacks', 'Roasted mixed nuts 200g', 'MN-200-001', 6.99),
('Chocolate Bar Dark 100g', 'snacks', 'Dark chocolate bar 70% cocoa 100g', 'CB-100-001', 3.29),
('Pretzels 250g', 'snacks', 'Salted pretzels 250g bag', 'PR-250-001', 2.99),

-- Beverages
('Sparkling Water 500ml', 'beverage', 'Natural sparkling water 500ml', 'SW-500-001', 1.99),
('Energy Drink 250ml', 'beverage', 'Energy drink with caffeine 250ml', 'ED-250-001', 2.79),
('Green Tea 500ml', 'beverage', 'Iced green tea 500ml', 'GT-500-001', 2.29),
('Coffee Cold Brew 300ml', 'beverage', 'Cold brew coffee 300ml', 'CB-300-001', 3.49),

-- Frozen Foods
('Ice Cream Vanilla 500ml', 'frozen', 'Premium vanilla ice cream 500ml', 'IC-500-001', 4.99),
('Frozen Pizza Margherita', 'frozen', 'Frozen margherita pizza 350g', 'FP-350-001', 5.49),
('Frozen Vegetables Mix 500g', 'frozen', 'Mixed frozen vegetables 500g', 'FV-500-001', 3.99),

-- Personal Care
('Shampoo 400ml', 'personal_care', 'Moisturizing shampoo 400ml', 'SH-400-001', 7.99),
('Toothpaste 100ml', 'personal_care', 'Fluoride toothpaste 100ml', 'TP-100-001', 3.49),
('Hand Soap 300ml', 'personal_care', 'Antibacterial hand soap 300ml', 'HS-300-001', 2.99),

-- Household
('Paper Towels 6 Pack', 'household', 'Absorbent paper towels 6 roll pack', 'PT-6PK-001', 8.99),
('Dish Soap 500ml', 'household', 'Concentrated dish soap 500ml', 'DS-500-001', 3.79),
('Trash Bags 30 Count', 'household', 'Heavy duty trash bags 30 count', 'TB-30-001', 6.49);