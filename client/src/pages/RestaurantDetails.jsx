import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const RestaurantDetails = () => {
    const { id } = useParams();

    // 1. פלטת הצבעים והפונטים של וולט
    const woltPalette = {
        cyan: '#00c1a1',
        dark: '#202125',
        gray: '#8a8d91',
        lightGray: '#f8f8f8',
        white: '#ffffff',
        shadow: 'rgba(0, 0, 0, 0.08)',
    };

    const fontStyle = { fontFamily: "'Nunito', sans-serif" };

    // 2. State זמני כדי שנוכל לבנות את רשת המוצרים לפני ה-fetch האמיתי
    // (צרי רק 6-9 מנות כדי לראות את הגריד)
    const [products, setProducts] = useState([
        { id: 1, name: "King of Burgers Meal", description: "Giant burger + fries + large drink. All the classics, all the tastiness.", price: 69.00, image: "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg" },
        { id: 2, name: "Veggie Delight Deluxe", description: "Our plant-based hero. Beyond Patty, avocado, vegan mayo.", price: 73.00, image: "https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/7ec57da9-c437-4d94-a78b-d72b2167d730.jpg" },
        { id: 3, name: "Double Trouble Stack", description: "Two 150g patties, cheddar, bacon. A burger lover's dream.", price: 81.00, image: "https://www.foodiesfeed.com/wp-content/uploads/2023/06/fresh-pork-steak-or-burgers-with-crispy-fries-on-a-wooden-board-500x334.jpg" },
        { id: 4, name: "Crunchy Chicken Supreme", description: "Breaded chicken breast, lettuce, special sauce. Simple, perfect.", price: 65.00, image: "https://www.fastfoodpost.com/wp-content/uploads/2021/01/Burger-King-Unveils-New-Crunchy-Chicken-Burger-in-Select-Markets-500x334.jpg" },
        { id: 5, name: "Family Meal Deal", description: "4 Burgers, 2 large fries, 1.5L drink. Feeds a whole kingdom.", price: 219.00, image: "https://images.deliveryhero.io/image/fd-sg/Products/Burger-King/Family-Meals/Family-Meal-1.jpg" },
        { id: 6, name: "Classic French Fries", description: "Golden, crispy, salty. The perfect companion.", price: 19.00, image: "https://www.willflyforfood.net/wp-content/uploads/2021/04/fast-food-fries.jpg" },
    ]);

    // 3. קומפוננטה זמנית לעיצוב MenuItem בודד בתוך ה-pages
    // (זה השלד של ה-MenuItem שמעצב רק את ה-UI, לא נחבר לו הוספה לסל עדיין)
    const menuItemPlaceholder = (product) => (
        <div key={product.id} style={{
            display: 'flex',
            backgroundColor: woltPalette.white,
            borderRadius: '12px',
            border: `1px solid ${woltPalette.lightGray}`,
            boxShadow: `0 2px 8px ${woltPalette.shadow}`,
            padding: '16px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${woltPalette.shadow}`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${woltPalette.shadow}`;
            }}
        >
            {/* צד שמאל: תמונה וכפתור פלוס */}
            <div style={{ position: 'relative', flex: '0 0 100px', marginRight: '16px' }}>
                <img src={product.image} alt={product.name} style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                }} />
                <button style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '15px',
                    backgroundColor: woltPalette.cyan,
                    border: 'none',
                    color: woltPalette.white,
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>+</button>
            </div>

            {/* צד ימין: טקסט ומחיר */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', ...fontStyle, color: woltPalette.dark }}>
                    {product.name}
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: woltPalette.gray, ...fontStyle, lineHeight: '1.4' }}>
                    {product.description}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', ...fontStyle, color: woltPalette.dark }}>
                        ₪{product.price.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: woltPalette.lightGray, minHeight: '100vh', ...fontStyle }}>
            {/* חלק 1: הבאנר הענק */}
            <div style={{
                width: '100%',
                height: '300px',
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%), url('https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}></div>

            {/* חלק 2: כרטיסיית הראש ה"צפה" (הבהרה מהתמונה 7) */}
            <div style={{
                maxWidth: '1200px',
                margin: '-80px auto 40px auto', // אפקט "ציפה" על הבאנר
                backgroundColor: woltPalette.white,
                borderRadius: '12px',
                padding: '32px',
                boxShadow: `0 6px 16px rgba(0, 0, 0, 0.1)`,
                position: 'relative',
                zIndex: '1',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                {/* צד ימין של הכרטיסייה: שם ותיאור */}
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '900', color: woltPalette.dark }}>The King's Burger House</h1>
                    <p style={{ margin: '0 0 24px 0', fontSize: '18px', color: woltPalette.gray }}>🍔 Hand-Crafted Burgers • Ramat Gan House 🍔</p>

                    {/* תגיות זמנים - כמו בתמונה 7 */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <div style={{ backgroundColor: '#e0fbf8', color: woltPalette.cyan, padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Pickup 15-20 min</div>
                        <div style={{ backgroundColor: '#e0fbf8', color: woltPalette.cyan, padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Delivery 40-50 min</div>
                    </div>
                </div>

                {/* צד שמאל של הכרטיסייה: דירוג */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: woltPalette.dark }}>4.7</div>
                    <div style={{ fontSize: '14px', color: woltPalette.gray }}>⭐️ Ratings and reviews</div>
                </div>
            </div>

            {/* חלק 3: רשימת המוצרים (כותרת וגריד של MenuItem) */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: woltPalette.dark, margin: '0 0 24px 0' }}>The Entire Menu</h2>

                {/* הגריד של המוצרים (כמו בתמונה 8, ללא קטגוריות) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    paddingBottom: '60px',
                }}>
                    {products.map(product => menuItemPlaceholder(product))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;