'use client';

import { useEffect, useState } from 'react';
import { supabase, isMockMode } from '@/lib/supabase';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Package,
    Save,
    X,
    FileSpreadsheet
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    category_id: string;
    rarity?: string;
    condition?: string;
    buy_price: number;
    sell_price: number;
    stock: number;
    card_set?: string;
    card_number?: string;
    description?: string;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Edit / Add Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [rarity, setRarity] = useState('');
    const [condition, setCondition] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [stock, setStock] = useState('');
    const [cardSet, setCardSet] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [description, setDescription] = useState('');

    const loadData = async () => {
        try {
            if (!isMockMode && supabase) {
                const { data: dbProducts } = await supabase.from('products').select('*');
                const { data: dbCategories } = await supabase.from('categories').select('*');
                setProducts(dbProducts || []);
                setCategories(dbCategories || []);
            } else {
                const mockProds = localStorage.getItem('gamegrad_products');
                if (mockProds) {
                    setProducts(JSON.parse(mockProds));
                } else {
                    const defaultProds = [
                        { id: '1', name: 'Charizard VMAX', sku: 'PKM-001', category_id: 'cat_pokemon', rarity: 'Secret Rare', condition: 'Near Mint', buy_price: 1500, sell_price: 3500, stock: 2, card_set: 'Darkness Ablaze' },
                        { id: '2', name: 'Luffy Parallel Sec', sku: 'OP-001', category_id: 'cat_onepiece', rarity: 'Secret Rare', condition: 'Near Mint', buy_price: 2500, sell_price: 5500, stock: 5, card_set: 'Romance Dawn' },
                        { id: '3', name: 'Blue-Eyes White Dragon', sku: 'YGO-001', category_id: 'cat_yugioh', rarity: 'Ultra Rare', condition: 'Excellent', buy_price: 800, sell_price: 1800, stock: 1, card_set: 'Legendary Collection' },
                    ];
                    localStorage.setItem('gamegrad_products', JSON.stringify(defaultProds));
                    setProducts(defaultProds);
                }
                setCategories([
                    { id: 'cat_pokemon', name: 'Pokémon', slug: 'pokemon' },
                    { id: 'cat_onepiece', name: 'One Piece', slug: 'one-piece' },
                    { id: 'cat_yugioh', name: 'Yu-Gi-Oh!', slug: 'yugioh' },
                    { id: 'cat_others', name: 'Others', slug: 'others' }
                ]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openAddModal = () => {
        setIsEditing(false);
        setName('');
        setSku('SKU-' + Math.floor(Math.random() * 9000 + 1000));
        setCategoryId(categories[0]?.id || '');
        setRarity('Secret Rare');
        setCondition('Near Mint');
        setBuyPrice('');
        setSellPrice('');
        setStock('');
        setCardSet('');
        setCardNumber('');
        setDescription('');
        setIsOpen(true);
    };

    const openEditModal = (p: Product) => {
        setIsEditing(true);
        setCurrentId(p.id);
        setName(p.name);
        setSku(p.sku);
        setCategoryId(p.category_id);
        setRarity(p.rarity || '');
        setCondition(p.condition || '');
        setBuyPrice(p.buy_price.toString());
        setSellPrice(p.sell_price.toString());
        setStock(p.stock.toString());
        setCardSet(p.card_set || '');
        setCardNumber(p.card_number || '');
        setDescription(p.description || '');
        setIsOpen(true);
    };

    const saveProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const productPayload = {
            name,
            sku,
            category_id: categoryId || null,
            rarity,
            condition,
            buy_price: Number(buyPrice || 0),
            sell_price: Number(sellPrice || 0),
            stock: Number(stock || 0),
            card_set: cardSet,
            card_number: cardNumber,
            description,
        };

        try {
            if (!isMockMode && supabase) {
                if (isEditing) {
                    const { error } = await supabase
                        .from('products')
                        .update(productPayload)
                        .eq('id', currentId);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('products')
                        .insert(productPayload);
                    if (error) throw error;
                }
            } else {
                // Mock DB implementation
                const localProds = JSON.parse(localStorage.getItem('gamegrad_products') || '[]');
                if (isEditing) {
                    const idx = localProds.findIndex((p: Product) => p.id === currentId);
                    if (idx > -1) {
                        localProds[idx] = { id: currentId, ...productPayload };
                    }
                } else {
                    localProds.push({ id: 'mock_' + Date.now(), ...productPayload });
                }
                localStorage.setItem('gamegrad_products', JSON.stringify(localProds));
            }
            setIsOpen(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า');
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้ออกจากสต็อก?')) return;
        try {
            if (!isMockMode && supabase) {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
            } else {
                const localProds = JSON.parse(localStorage.getItem('gamegrad_products') || '[]');
                const filtered = localProds.filter((p: Product) => p.id !== id);
                localStorage.setItem('gamegrad_products', JSON.stringify(filtered));
            }
            loadData();
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการลบสินค้า');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Title block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Inventory Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>จัดการสต็อกสินค้า กำหนดราคารับซื้อ-ขายการ์ดเกมสะสมในร้าน</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} />
                    เพิ่มสินค้าใหม่
                </button>
            </div>

            {/* Filters block */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อการ์ด / SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>กำลังโหลดข้อมูลสินค้า...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>ไม่พบข้อมูลรายการสินค้าในสต็อก</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>SKU / รหัสสินค้า</th>
                                <th style={{ padding: '1rem' }}>ชื่อการ์ด / สินค้า</th>
                                <th style={{ padding: '1rem' }}>ซีรีส์ / ภาค</th>
                                <th style={{ padding: '1rem' }}>ความหายาก (Rarity)</th>
                                <th style={{ padding: '1rem' }}>สภาพ (Condition)</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>ราคารับซื้อ</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>ราคาขาย</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>ในสต็อก</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>การควบคุม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p) => {
                                const cat = categories.find(c => c.id === p.category_id);
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{p.sku}</td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.card_set || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                                                {p.rarity || 'Normal'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--color-success)', fontWeight: 'bold' }}>{p.condition || 'NM'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#a78bfa' }}>฿{p.buy_price.toLocaleString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>฿{p.sell_price.toLocaleString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: p.stock <= 2 ? 'var(--color-danger)' : 'var(--text-primary)'
                                            }}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openEditModal(p)}>
                                                    <Edit3 size={14} />
                                                </button>
                                                <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-danger)' }} onClick={() => deleteProduct(p.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit/Add Modal */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '500px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 }}>
                                {isEditing ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ลงระบบ'}
                            </h2>
                            <button className="btn btn-secondary" style={{ padding: '0.25rem', border: 'none' }} onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รหัสสินค้า (SKU)</label>
                                    <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>หมวดหมู่สินค้า</label>
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ชื่อการ์ด / สินค้า</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น Charizard VMAX" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ซีรีส์ / ชุดซองการ์ด</label>
                                    <input type="text" value={cardSet} onChange={(e) => setCardSet(e.target.value)} placeholder="เช่น Darkness Ablaze" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รหัสการ์ด (Card Number)</label>
                                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="เช่น 020/189" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ความหายาก (Rarity)</label>
                                    <input type="text" value={rarity} onChange={(e) => setRarity(e.target.value)} placeholder="เช่น Secret Rare" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>สภาพการ์ด (Condition)</label>
                                    <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="เช่น Near Mint" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ราคารับซื้อ (฿)</label>
                                    <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ราคาขาย (฿)</label>
                                    <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>สต็อกปัจจุบัน</label>
                                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                    <Save size={16} />
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
