import random

categories = ['Grocery', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Household']
items = []
count = 1

grocery_names = [
    "Basmati Rice 1kg", "Toor Dal 500g", "Moong Dal 500g", "Chana Dal 500g", "Sugar 1kg", "Salt 1kg",
    "Wheat Flour 5kg", "Maida 1kg", "Besan 500g", "Mustard Oil 1L", "Sunflower Oil 1L", "Olive Oil 500ml",
    "Ghee 500g", "Poha 500g", "Suji 500g", "Turmeric Powder 100g", "Red Chilli Powder 100g"
]

dairy_names = [
    "Full Cream Milk 1L", "Toned Milk 1L", "Curd 400g", "Paneer 200g", "Butter 100g", "Cheese Slices 200g",
    "Mozzarella Cheese 200g", "Yogurt 200g", "Buttermilk 500ml", "Lassi 200ml", "Flavored Milk 200ml",
    "Whipping Cream 200ml", "Condensed Milk 400g", "Gouda Cheese 200g", "Cheddar Cheese 200g", "Skimmed Milk 1L", "Probiotic Drink 65ml"
]

snacks_names = [
    "Potato Chips 50g", "Nachos 100g", "Namkeen 200g", "Bhujia 200g", "Mixture 200g", "Peanuts 200g",
    "Biscuits 150g", "Cookies 150g", "Cream Biscuits 100g", "Crackers 100g", "Popcorn 100g", "Extruded Snacks 50g",
    "Khakhra 200g", "Mathri 200g", "Chocolates 50g", "Wafers 100g", "Diet Snacks 100g"
]

beverages_names = [
    "Cola 500ml", "Orange Soda 500ml", "Lemon Soda 500ml", "Mango Juice 1L", "Apple Juice 1L", "Mixed Fruit Juice 1L",
    "Energy Drink 250ml", "Cold Coffee 200ml", "Iced Tea 500ml", "Packaged Water 1L", "Soda Water 750ml",
    "Tonic Water 250ml", "Ginger Ale 250ml", "Tea Powder 500g", "Coffee Powder 50g", "Green Tea 100g", "Health Drink 500g"
]

personal_care_names = [
    "Bathing Soap 100g", "Shampoo 200ml", "Conditioner 200ml", "Toothpaste 100g", "Toothbrush 1pc", "Face Wash 100ml",
    "Body Lotion 200ml", "Talcum Powder 100g", "Deodorant 150ml", "Hair Oil 200ml", "Hair Gel 100g",
    "Shaving Cream 100g", "Razor 1pc", "Hand Wash 250ml", "Sanitizer 100ml", "Wet Wipes 30pcs", "Cotton Swabs 100pcs"
]

household_names = [
    "Dishwash Liquid 500ml", "Dishwash Bar 200g", "Detergent Powder 1kg", "Detergent Liquid 1L", "Fabric Conditioner 500ml",
    "Floor Cleaner 500ml", "Toilet Cleaner 500ml", "Glass Cleaner 250ml", "Air Freshener 150g", "Mosquito Repellent 45ml",
    "Garbage Bags 30pcs", "Aluminium Foil 9m", "Cling Film 30m", "Tissue Paper 100pcs", "Kitchen Towel 2pcs",
    "Sponge 2pcs", "Scrub Pad 2pcs"
]

cat_lists = [grocery_names, dairy_names, snacks_names, beverages_names, personal_care_names, household_names]

for i, cat in enumerate(categories):
    names = cat_lists[i]
    for name in names:
        if count > 100: break
        items.append(f"('{name}', 'GRO{count:03d}', '{cat}', {round(random.uniform(1.0, 20.0), 2)}, 5.00)")
        count += 1

sql = f"""-- ============================================================
-- POS & Inventory Management System - Seed Data
-- 100 Grocery Items
-- ============================================================

INSERT IGNORE INTO users (username, email, password_hash, role, approved, approved_at) VALUES
('admin',   'admin@pos.com',   '$2a$10$wUOgENCoxkPgnErKdK1OXO7eLrmPv9zsNRMGlH4ZJ5WK.WjCuVoSa', 'ADMIN',            TRUE, NOW()),
('manager', 'manager@pos.com', '$2a$10$wUOgENCoxkPgnErKdK1OXO7eLrmPv9zsNRMGlH4ZJ5WK.WjCuVoSa', 'STORE_MANAGER',    TRUE, NOW()),
('cashier', 'cashier@pos.com', '$2a$10$wUOgENCoxkPgnErKdK1OXO7eLrmPv9zsNRMGlH4ZJ5WK.WjCuVoSa', 'CASHIER',          TRUE, NOW());

UPDATE users SET approved=TRUE, approved_at=NOW() WHERE approved=FALSE AND created_at IS NULL;

INSERT IGNORE INTO products (name, barcode, category, price, tax_rate) VALUES
{",\\n".join(items)};
"""

with open('src/main/resources/data.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
