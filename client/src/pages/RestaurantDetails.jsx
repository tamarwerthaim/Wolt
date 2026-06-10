import React, { useState, useEffect } from 'react'; // תוספת: ייבוא useEffect
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

    // 2. סטייטים לניהול הנתונים מהשרת
    const [products, setProducts] = useState([]); // מתחיל כמערך ריק
    const [loading, setLoading] = useState(true); // סטייט טעינה
    const [error, setError] = useState('');       // סטייט שגיאה

    // 3. אפקט משיכת הנתונים מהשרת
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError('');

                // בקשת GET לנתיב הדינמי בשרת שלכן לפורט 3000
                const response = await fetch(`http://localhost:3000/api/restaurants/${id}/products`);

                if (!response.ok) {
                    throw new Error('Failed to fetch menu products for this restaurant.');
                }

                const data = await response.json();
                setProducts(data); // עדכון המוצרים האמיתיים מהשרת!
            } catch (err) {
                setError(err.message || 'Something went wrong while loading the menu.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProducts();
        }
    }, [id]); // האפקט ירוץ מחדש אם ה-id בכתובת ה-URL משתנה

    // 4. קומפוננטה זמנית לעיצוב MenuItem בתוך ה-page
    const menuItemPlaceholder = (product) => (
        <div key={product.id || product._id} style={{
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
                {/* אם אין תמונה למוצר בשרת, נשים תמונת פלייסהולדר כללית של המבורגר */}
                <img src={product.image || "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg"}
                    alt={product.name}
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                    }}
                />
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
                    {product.description || 'No description available for this delicious dish.'}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', ...fontStyle, color: woltPalette.dark }}>
                        ₪{Number(product.price).toFixed(2)}
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

            {/* חלק 2: כרטיסיית הראש ה"צפה" */}
            <div style={{
                maxWidth: '1200px',
                margin: '-80px auto 40px auto',
                backgroundColor: woltPalette.white,
                borderRadius: '12px',
                padding: '32px',
                boxShadow: `0 6px 16px rgba(0, 0, 0, 0.1)`,
                position: 'relative',
                zIndex: '1',
                display: 'flex',
                justifyContent: 'space-between',
            }}>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '900', color: woltPalette.dark }}>Restaurant Menu View</h1>
                    <p style={{ margin: '0 0 24px 0', fontSize: '18px', color: woltPalette.gray }}>Viewing products for Restaurant ID: {id}</p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <div style={{ backgroundColor: '#e0fbf8', color: woltPalette.cyan, padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Pickup 15-20 min</div>
                        <div style={{ backgroundColor: '#e0fbf8', color: woltPalette.cyan, padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Delivery 40-50 min</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: woltPalette.dark }}>4.7</div>
                    <div style={{ fontSize: '14px', color: woltPalette.gray }}>⭐️ Ratings and reviews</div>
                </div>
            </div>

            {/* חלק 3: רשימת המוצרים (כותרת וגריד של MenuItem) */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: woltPalette.dark, margin: '0 0 24px 0' }}>The Entire Menu</h2>

                {/* 5. הצגת מצבי טעינה, שגיאה או תפריט ריק */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: woltPalette.cyan, fontWeight: '600' }}>
                        🚴‍♂️ Loading restaurant's delicious menu...
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: 'red', fontWeight: '600' }}>
                        ❌ Error: {error}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: woltPalette.gray }}>
                        🍔 This restaurant hasn't added any dishes to the menu yet.
                    </div>
                )}

                {/* הגריד של המוצרים האמיתיים מהשרת */}
                {!loading && !error && products.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '24px',
                        paddingBottom: '60px',
                    }}>
                        {products.map(product => menuItemPlaceholder(product))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetails;