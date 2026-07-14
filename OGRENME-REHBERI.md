# Proje Öğrenme Rehberi — Fake E-Commerce (Next.js + Tailwind)

Bu dosya, projede şu ana kadar yapılan her şeyi adım adım anlatır: kim ne yaptı, hangi dosya ne işe yarıyor, hangi fonksiyon nerede kullanılıyor ve neden öyle yazıldı. Öğrenme aşamasında olduğun için her bölümde küçük, projeden bağımsız mini örnekler de var.

---

## 1. Proje ne yapıyor?

FakeStoreAPI (`https://fakestoreapi.com`) üzerinden ürün çekip listeleyen, ürün detayına gidilebilen ve sepete ürün eklenebilen basit bir e-ticaret arayüzü. Next.js'in **App Router** yapısını kullanıyor (yani route'lar `src/app` klasöründeki klasör/dosya isimleriyle belirleniyor).

Klasör yapısı özet:

```
src/
  app/
    layout.jsx          -> Tüm sayfaları saran ortak iskelet (Nav + Footer + Cart verisi)
    page.jsx             -> "/" ana sayfa: ürün listesi
    products/[id]/page.jsx -> "/products/123" ürün detay sayfası
    cart/page.jsx         -> "/cart" sepet sayfası
    users/page.jsx        -> "/users" (deneme/placeholder sayfa)
  components/
    Nav.jsx               -> Üst navigasyon çubuğu
    Footer.jsx            -> Alt bilgi
    AddToCartButton.jsx    -> "Sepete ekle" butonu
  context/
    CartContext.jsx        -> Sepet verisinin (state) tutulduğu merkezi yer
  lib/
    api.js                -> FakeStoreAPI'den veri çeken fonksiyonlar
next.config.mjs           -> Next.js ayarları (görsel izinleri vs.)
```

---

## 2. Next.js App Router temelleri (önemli kurallar)

### 2.1 `page.jsx` dosya adı kesinlikle küçük harfle yazılmalı

Bu projede yaşadığımız **ilk büyük hata** buydu: `src/app/cart/Page.jsx` ve `src/app/users/Page.jsx` dosyaları büyük "P" ile yazılmıştı. Next.js App Router'da bir klasörün route olarak sayılması için içinde **tam olarak küçük harfle** `page.jsx` (ya da `page.js/.tsx`) adında bir dosya olması **şart**. `Page.jsx` bir "özel dosya" olarak tanınmıyor, dolayısıyla `/cart` ve `/users` adreslerine gidildiğinde sayfa bulunamıyordu.

Çözüm: `git mv src/app/cart/Page.jsx src/app/cart/page.jsx` (aynısı `users` için de yapıldı).

**Mini örnek — dosya tabanlı routing mantığı:**
```
src/app/hakkimizda/page.jsx  ->  tarayıcıda "/hakkimizda" adresini açar
src/app/blog/[slug]/page.jsx ->  tarayıcıda "/blog/herhangi-bir-yazi" adresini açar
```
Klasör adı = URL yolu. `page.jsx` içindeki component = o sayfanın içeriği.

### 2.2 `layout.jsx` — ortak iskelet

`src/app/layout.jsx`, App Router'da **her sayfayı saran** özel bir dosyadır. İçindeki `{children}` yer tutucusuna, o an ziyaret edilen sayfanın içeriği (`page.jsx`) otomatik olarak yerleştirilir. Bu yüzden Nav ve Footer'ı her sayfada tekrar yazmaya gerek yok — layout'a bir kere koyduk, her sayfada görünüyor:

```jsx
<body className="min-h-full flex flex-col">
  <CartProvider>
    <Nav />
    {children}   {/* <- burada page.jsx'in içeriği render edilir */}
    <Footer />
  </CartProvider>
</body>
```

### 2.3 Dynamic route: `[id]`

`src/app/products/[id]/page.jsx` içindeki köşeli parantezli `[id]` klasör adı, **dinamik bir segment** demektir. `/products/1`, `/products/2`, `/products/anything` gibi tüm adresler bu dosyaya düşer ve `id` değeri parametre olarak component'e geçilir:

```jsx
const ProductPage = async ({ params }) => {
    const { id } = await params;   // Next 16'da params bir Promise, bu yüzden await gerekiyor
    const product = await fetchProduct(id);
    ...
}
```

**Mini örnek:** `src/app/blog/[slug]/page.jsx` yazarsan, `/blog/merhaba-dunya` adresine gidildiğinde `params.slug === "merhaba-dunya"` olur.

---

## 3. Server Component vs Client Component

Bu, Next.js App Router'ın en kafa karıştırıcı ama en önemli kavramı.

- **Server Component (varsayılan):** Dosyanın başında `"use client"` yazmazsan, component sunucuda çalışır, tarayıcıya sadece hazır HTML gönderilir. `async/await` kullanabilir (örn. `fetchProducts()` çağırmak). Ama `useState`, `useEffect`, `onClick` gibi tarayıcıda çalışması gereken şeyleri **kullanamaz**.
- **Client Component:** Dosyanın en üstüne `"use client";` yazarsan, component tarayıcıda (client'ta) çalışır. State, event handler (`onClick`), `useEffect`, `localStorage`, `usePathname` gibi şeyleri ancak burada kullanabilirsin.

Projede kim hangisi:

| Dosya | Tipi | Neden |
|---|---|---|
| `src/app/page.jsx` | Server | Sadece veri çekip listeliyor, tıklama/etkileşim state'i yok |
| `src/app/products/[id]/page.jsx` | Server | Aynı sebep, tek ürün verisi çekiyor |
| `src/app/cart/page.jsx` | Client (`"use client"`) | `useCart()` hook'u ile state okuyup butonlara `onClick` bağlıyor |
| `src/components/Nav.jsx` | Client (`"use client"`) | Mobil menü açık/kapalı state'i (`useState`) ve aktif link (`usePathname`) var |
| `src/components/AddToCartButton.jsx` | Client (`"use client"`) | Butona tıklama (`onClick`) ve kısa süreli "Added" state'i var |
| `src/context/CartContext.jsx` | Client (`"use client"`) | `useState`, `useEffect`, `localStorage` kullanıyor |

**Mini örnek:**
```jsx
// Server component (varsayılan) — sadece veri gösterir
const Page = async () => {
  const data = await fetch("...").then(r => r.json());
  return <div>{data.title}</div>;
};

// Client component — tıklamaya tepki verir
"use client";
import { useState } from "react";
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 4. `src/lib/api.js` — Veri çekme katmanı

Bu dosyada FakeStoreAPI'ye istek atan iki fonksiyon var. Amaç: `fetch` mantığını sayfa dosyalarından ayırmak (böylece her sayfada aynı `fetch(...)` kodu tekrar etmiyor).

```js
export const fetchProducts = async () => {
    const response = await fetch('https://fakestoreapi.com/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    return await response.json()
}

export const fetchProduct = async (id) => {
    const response = await fetch(`https://fakestoreapi.com/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return await response.json()
}
```

- `fetchProducts()` -> **tüm ürün listesini** döner (dizi). `src/app/page.jsx` bunu kullanıyor.
- `fetchProduct(id)` -> **tek bir ürünü** döner (obje). `src/app/products/[id]/page.jsx` bunu kullanıyor.

### Burada yaşanan ikinci hata

Sohbetin bir noktasında bu dosya şöyle değişmişti:
```js
import Page from "@/app/page";   // gereksiz, hatta anlamsız (döngüsel) bir import

const fetchProducts = async (id) => {   // artık "id" parametresi bekliyor!
    const response = await fetch(`https://fakestoreapi.com/products/${id}`)
    ...
}
export default fetchProducts;
```
Yani `fetchProducts` fonksiyonu **tek ürün çeken** bir fonksiyona dönüşmüştü ama ana sayfa hâlâ `fetchProducts()` diye **parametresiz, tüm listeyi bekleyerek** çağırıyordu. Sonuç: `id` olarak `undefined` gidiyor, `https://fakestoreapi.com/products/undefined` isteği atılıyor, dönen tek obje `.map()` ile işlenmeye çalışılınca hata oluşuyordu (çünkü `.map` sadece dizilerde çalışır, objede yoktur).

Çözüm: İki ayrı, isimli (`named export`) fonksiyon tanımlayıp (`fetchProducts` ve `fetchProduct`), her sayfanın ihtiyacına göre doğru olanı çağırmasını sağladık. Ayrıca anlamsız `import Page from "@/app/page"` satırını sildik.

**Mini örnek — named export vs default export:**
```js
// named export: birden fazla şey export edebilirsin, isimle import edilir
export const a = () => {};
export const b = () => {};
import { a, b } from "./dosya";

// default export: dosya başına sadece bir tane olur, istediğin isimle import edebilirsin
export default function a() {}
import herhangiBirIsim from "./dosya";
```

---

## 5. `src/app/page.jsx` — Ana sayfa (ürün listesi)

Adım adım ne yapıyor:

1. `fetchProducts()` ile tüm ürünleri çekiyor (server component olduğu için doğrudan `await` kullanabiliyoruz).
2. `products.map(...)` ile her ürün için bir kart (`<Link>`) oluşturuyor.
3. Her kart tıklanabilir: `href={`/products/${product.id}`}` sayesinde tıklanınca o ürünün detay sayfasına gidiyor.
4. Kart içinde: `next/image` ile ürün görseli, kategori, başlık, kısa açıklama, fiyat ve `<AddToCartButton />`.

```jsx
{products?.map((product) => (
    <Link key={product.id} href={`/products/${product.id}`}>
        <Image src={product.image} alt={product.title} fill ... />
        <h2>{product.title}</h2>
        <AddToCartButton product={product} />
    </Link>
))}
```

Küçük detaylar:
- `products?.map(...)` — `?.` (optional chaining): `products` `undefined`/`null` ise hata vermeden `undefined` döner, uygulama çökmez.
- `key={product.id}` — React'ın liste elemanlarını takip edebilmesi için her elemana **benzersiz** bir `key` vermek zorunludur.
- Tailwind sınıfları: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` -> ekran genişliğine göre kart sayısını 1'den 4'e çıkarıyor (responsive grid). `line-clamp-2` -> metni en fazla 2 satırla sınırlayıp gerisini `...` ile kesiyor.

**Mini örnek — `.map()` ile liste render etme:**
```jsx
const isimler = ["Ali", "Ayşe", "Mehmet"];
<ul>
  {isimler.map((isim) => <li key={isim}>{isim}</li>)}
</ul>
```

---

## 6. `src/app/products/[id]/page.jsx` — Ürün detay sayfası

`fetchProduct(id)` ile tek ürünü çekip; görsel, kategori, başlık, puan (`rating`), açıklama, fiyat ve sepete ekle butonunu büyük bir kart içinde gösteriyor. Ayrıca üstte "← Back to products" linki var (`href="/"`).

Bu sayfada `AddToCartButton` bir `<Link>` içinde **değil**, bu yüzden `preventDefault`/`stopPropagation` gerekmiyor — düz bir buton gibi çalışıyor (ama component aynı, çünkü zaten güvenli şekilde yazıldı).

---

## 7. `src/context/CartContext.jsx` — Sepetin "beyni"

### Neden Context API kullandık?

Sepet bilgisi (hangi ürünler, kaç adet) birden fazla yerde lazım: Ana sayfadaki "Sepete ekle" butonu, ürün detay sayfası, sepet sayfası ve Nav'daki sayaç. Bu veriyi her component'e tek tek prop olarak taşımak (`props drilling`) yerine, **React Context API** ile "herkesin erişebildiği ortak bir kutu" oluşturduk.

**Mini örnek — Context API'nin en yalın hâli:**
```jsx
// 1. Kutuyu oluştur
const TemaContext = createContext(null);

// 2. Kutuyu doldurup, alt component'lere sağlayan Provider
function TemaProvider({ children }) {
  const [tema, setTema] = useState("açık");
  return (
    <TemaContext.Provider value={{ tema, setTema }}>
      {children}
    </TemaContext.Provider>
  );
}

// 3. Herhangi bir alt component'te kutuyu oku
function TemaButonu() {
  const { tema, setTema } = useContext(TemaContext);
  return <button onClick={() => setTema("koyu")}>{tema}</button>;
}
```
Projedeki `CartContext`, `TemaContext` ile birebir aynı mantıkla çalışıyor; sadece kutunun içinde tema yerine sepet verisi var.

### Dosyanın içindekiler, satır satır

```js
const CartContext = createContext(null);
```
Kutuyu oluşturuyoruz. Başlangıç değeri `null` (henüz kimse doldurmadı).

```js
const [items, setItems] = useState([]);
```
Sepetteki ürünler bir dizi olarak tutuluyor: `[{ id, title, price, image, quantity }, ...]`.

```js
useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setItems(JSON.parse(stored));
    setIsLoaded(true);
}, []);
```
Sayfa ilk açıldığında (component "mount" olduğunda, bağımlılık dizisi `[]` olduğu için **sadece bir kez** çalışır), tarayıcının `localStorage`'ında daha önce kaydedilmiş sepet var mı diye bakıyor, varsa `items` state'ine yüklüyor. Bu sayede **sayfayı yenilesen bile sepet kaybolmuyor**.

```js
useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}, [items, isLoaded]);
```
`items` her değiştiğinde (ürün eklendiğinde/çıkarıldığında), güncel sepeti tekrar `localStorage`'a yazıyor. `isLoaded` kontrolü olmasaydı, sayfa ilk açıldığında henüz `localStorage`'dan okuma bitmeden `items` (boş dizi `[]`) tekrar yazılıp, kayıtlı sepeti **silme riski** olurdu.

**Mini örnek — `useEffect` bağımlılık dizisi:**
```jsx
useEffect(() => { console.log("sadece 1 kere çalışır"); }, []);
useEffect(() => { console.log("items her değiştiğinde çalışır"); }, [items]);
useEffect(() => { console.log("her render'da çalışır (nadiren istenir)"); });
```

```js
const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
            return prev.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        }
        return [...prev, { id: product.id, title: product.title, price: product.price, image: product.image, quantity }];
    });
};
```
Ürün sepete eklenirken önce **zaten sepette var mı** diye bakıyor (`find`):
- Varsa: o ürünün `quantity` (adet) değerini artırıyor.
- Yoksa: sepete yeni bir eleman olarak ekliyor.

`{ ...item, quantity: ... }` -> **spread operator**: `item` objesinin tüm alanlarını kopyalayıp sadece `quantity` alanını güncelliyoruz (React'ta state'i **doğrudan değiştirmek yerine yeni bir obje/dizi oluşturmak** gerekir, buna "immutability" denir).

**Mini örnek — spread operator ile obje güncelleme:**
```js
const urun = { ad: "Kalem", fiyat: 10 };
const guncellenmis = { ...urun, fiyat: 15 }; // { ad: "Kalem", fiyat: 15 }
```

```js
const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
};
```
`filter` ile verilen `id`'ye **sahip olmayan** tüm ürünleri tutup, o ürünü listeden çıkarıyor.

```js
const updateQuantity = (id, quantity) => {
    if (quantity < 1) { removeFromCart(id); return; }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
};
```
Sepet sayfasındaki `+`/`-` butonları bunu çağırıyor. Adet 0'ın altına inerse ürünü tamamen sepetten kaldırıyor.

```js
const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
```
`reduce` ile dizideki tüm elemanları **tek bir değere** indirgiyoruz: toplam ürün adedi ve toplam tutar.

**Mini örnek — `reduce`:**
```js
const sayilar = [1, 2, 3, 4];
const toplam = sayilar.reduce((acc, n) => acc + n, 0); // 10
```

```js
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
```
Bu, "custom hook" dediğimiz bir yapı — her component'te `useContext(CartContext)` yazmak yerine, kısaca `useCart()` diyoruz. Eğer biri yanlışlıkla `<CartProvider>` sarmalayıcısının **dışında** bu hook'u kullanırsa (yani kutu hiç doldurulmamışsa), anlamlı bir hata fırlatıyor — sessizce `undefined` dönüp ileride garip hatalara yol açmasın diye.

---

## 8. `src/components/AddToCartButton.jsx` — Sepete ekle butonu

```jsx
"use client";
const AddToCartButton = ({ product, className }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    return (
        <button onClick={handleClick} className={className ?? "..."}>
            {added ? "Added ✓" : "Add to cart"}
        </button>
    );
};
```

Neden `event.preventDefault()` ve `event.stopPropagation()` var? Çünkü ana sayfada (`page.jsx`) bu buton, tüm kartı saran bir `<Link>` elemanının **içinde**. Eğer bu iki satır olmasaydı, butona tıkladığında hem "sepete ekle" tetiklenir hem de `Link` algılayıp seni ürün detay sayfasına **yönlendirirdi** — istenmeyen bir davranış. `stopPropagation()` tıklamanın üst elemana (Link'e) "sızmasını" engelliyor, `preventDefault()` ise linkin varsayılan yönlendirme davranışını iptal ediyor.

`added` state'i ise sadece görsel geri bildirim için: tıklanınca 1.2 saniyeliğine "Added ✓" yazıp sonra eski haline dönüyor (`setTimeout`).

**Mini örnek — `stopPropagation` neden gerekli:**
```jsx
<div onClick={() => console.log("dış kutuya tıklandı")}>
  <button onClick={(e) => { e.stopPropagation(); console.log("sadece butona tıklandı"); }}>
    Tıkla
  </button>
</div>
```
`stopPropagation` olmasaydı, butona tıklayınca **hem** "sadece butona tıklandı" **hem de** "dış kutuya tıklandı" yazardı, çünkü tarayıcıda tıklama olayları içten dışa doğru "kabarcıklanır" (event bubbling).

---

## 9. `src/app/cart/page.jsx` — Sepet sayfası

Client component (`"use client"`), çünkü `useCart()` hook'unu kullanıp butonlara tıklama davranışı bağlıyor.

- Sepet boşsa (`items.length === 0`) -> "Your cart is empty" mesajı ve ana sayfaya dönüş linki gösteriliyor (bu, **conditional rendering / erken return** deseni).
- Sepet doluysa -> her ürün için: görsel, isim, fiyat, `-`/`+` adet butonları, satır toplamı, silme butonu (`✕`).
- En altta: "Clear cart" (tüm sepeti boşalt) ve genel toplam + "Checkout" butonu (şu an sadece görsel, gerçek bir ödeme akışına bağlı değil).

**Mini örnek — erken return (early return) deseni:**
```jsx
function Liste({ ogeler }) {
  if (ogeler.length === 0) return <p>Liste boş</p>;
  return <ul>{ogeler.map((o) => <li key={o}>{o}</li>)}</ul>;
}
```

---

## 10. `src/components/Nav.jsx` — Üst navigasyon

Zaten "profesyonel görünüm" için baştan tasarlanmıştı, sepet özelliği eklenirken üzerine şunlar eklendi:

```jsx
const { totalCount } = useCart();
...
{href === "/cart" && totalCount > 0 && (
    <span className="...rounded-full bg-indigo-600...">{totalCount}</span>
)}
```
"Cart" linkinin yanına, sepette en az 1 ürün varsa küçük yuvarlak bir sayaç (badge) ekleniyor. `&&` kullanımı: **kısa devre (short-circuit)** ile "her iki koşul da doğruysa bu JSX'i göster" demek.

Nav'ın diğer önemli kısımları (senin/benim daha önce yaptığımız):
- `usePathname()` -> şu an hangi sayfadayız bilgisini verir, aktif linki mavi renkte göstermek için kullanılıyor.
- `useState(false)` (`open`) -> mobilde hamburger menüsünün açık/kapalı durumunu tutuyor.

**Mini örnek — `&&` ile koşullu gösterme:**
```jsx
{sepetSayisi > 0 && <span>{sepetSayisi}</span>}
```
Eğer `sepetSayisi > 0` yanlışsa, React `false` değerini ekrana hiçbir şey basmadan yok sayar.

---

## 11. `next.config.mjs` — Görsel izinleri

```js
images: {
    remotePatterns: [
        { protocol: "https", hostname: "fakestoreapi.com", pathname: "/img/**" },
    ],
},
```
Next.js'in `next/image` bileşeni, **güvenlik nedeniyle** varsayılan olarak sadece kendi sunucundaki (veya izin verilen) görselleri optimize edip göstermene izin verir. Ürün görselleri `fakestoreapi.com` üzerinden geldiği için, bu domain'i "güvenilir" olarak buraya eklememiz gerekti; yoksa `next/image` "Invalid src prop... hostname is not configured" hatası verir.

---

## 12. Şu ana kadar bulunup düzeltilen hatalar (özet)

| # | Hata | Sebep | Çözüm |
|---|---|---|---|
| 1 | `/cart` ve `/users` sayfaları açılmıyordu | Dosya adları `Page.jsx` (büyük P) yazılmıştı, Next.js sadece küçük harfli `page.jsx`'i route olarak tanır | `git mv Page.jsx page.jsx` |
| 2 | Ana sayfa ürünleri listelerken hata veriyordu | `src/lib/api.js`'deki `fetchProducts` yanlışlıkla tek ürün çeken bir fonksiyona dönüştürülmüştü (`id` parametresi bekliyordu) ve gereksiz bir `import Page from "@/app/page"` vardı | `fetchProducts()` (liste) ve `fetchProduct(id)` (tekil) olarak iki ayrı, doğru fonksiyona ayrıldı |
| 3 | Görseller `next/image` ile yüklenmiyordu | `fakestoreapi.com` domaini `next.config.mjs`'de izinli değildi | `images.remotePatterns` eklendi |

---

## 13. Kimin ne yaptığı (kabaca)

- **Sen:** Proje iskeletini (Create Next App), `Nav`/`Footer` component'lerini, dinamik `[id]` route klasörünü, `src/lib/api.js`'in ilk hâlini ve genel proje fikrini oluşturdun; hataları fark edip bildirdin.
- **Ben (asistan):** Nav'ı profesyonel bir tasarıma kavuşturdum, `page.jsx`/`Page.jsx` büyük-küçük harf hatasını buldum ve düzelttim, `src/lib/api.js`'deki `fetchProducts`/`fetchProduct` karışıklığını ayırdım, ürün listesini kart grid'ine çevirdim, ürün detay sayfasını düzenledim, sepet sistemini (`CartContext`, `AddToCartButton`, sepet sayfası, Nav'daki sayaç) sıfırdan kurdum.

---

## 14. Öğrenmeye devam etmek istersen — sırada ne var?

Aşağıdakiler bu proje için mantıklı sonraki adımlar olurdu (istersen ayrı ayrı isteyebilirsin):
- Gerçek bir "Checkout" akışı (şu an buton sadece görsel).
- `loading.jsx` dosyası ekleyerek veri çekilirken iskelet/yükleniyor ekranı gösterme.
- Ürün arama/filtreleme (kategoriye göre).
- Kullanıcı girişi (auth) — `users` sayfasının gerçek bir işlevi olması için.