import React, { useEffect, useMemo, useState } from "react";
import {
  Car as CarIcon,
  Search,
  Settings,
  X,
  Filter as FilterIcon,
  MapPin,
  Gauge,
  Fuel,
  Calendar,
  Hash,
  Plus,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Navigation,
  Star,
  Trash,
  Reply,
  Upload,
  Download,
  Edit3,
} from "lucide-react";

// ------------------------- Config -------------------------
const LS_KEY = "car-sales-inventory";
const LS_REVIEWS = "car-sales-reviews";
const ADMIN_PASSCODE = "admin";
const BRAND_PRIMARY = '#C81414'; // red

// Business contact info (pre-filled for Argyll Vehicles)
const WHATSAPP_NUMBER = "+447950604363";
const BUSINESS_ADDRESS = "Argyll Vehicles Ltd. Pladda Way, Helensburgh, G84 9SE";
const COMPANY_REG = "SC856735";

// Branding logo: saved in localStorage by Admin → Branding
const LOGO_DATA_URI = (typeof window !== 'undefined' && localStorage.getItem('car-sales-brand-logo')) || "";

// Optional Google review link (set in Reviews → Admin box)
const GOOGLE_REVIEW_URL = (typeof window !== 'undefined' && localStorage.getItem('car-sales-google-review')) || "";

// ------------------------- Helpers -------------------------
function phoneForWa(num){ return String(num||'').replace(/[^0-9]/g,''); }
function waLink(num, text){
  const n = phoneForWa(num); if(!n) return '#';
  const t = encodeURIComponent(text||"Hi, I'm interested in one of your vehicles.");
  return `https://wa.me/${n}?text=${t}`;
}
function mapsDirLink(address){ return address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` : '#'; }
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function formatNumber(n){ try { return new Intl.NumberFormat().format(n); } catch { return n; } }

// ------------------------- Load/Save -------------------------
function loadInventory(){ try{ const raw = localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw);}catch{} return []; }
function saveInventory(v){ try{ localStorage.setItem(LS_KEY, JSON.stringify(v)); }catch{} }
function loadReviews(){ try{ const raw = localStorage.getItem(LS_REVIEWS); if(raw) return JSON.parse(raw);}catch{} return []; }
function saveReviews(v){ try{ localStorage.setItem(LS_REVIEWS, JSON.stringify(v)); }catch{} }

// ------------------------- Main App -------------------------
export default function CarSalesApp(){
  const [page, setPage] = useState('inventory'); // 'inventory' | 'reviews'
  const [inventory, setInventory] = useState(()=>loadInventory());
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({ make:"", body:"", fuel:"", transmission:"", maxPrice:"", yearMin:"", yearMax:"", maxMileage:"", location:"" });
  const [reviews, setReviews] = useState(()=>loadReviews());
  const [showAdd, setShowAdd] = useState(false);

  useEffect(()=>saveInventory(inventory),[inventory]);
  useEffect(()=>saveReviews(reviews),[reviews]);

  const filtered = useMemo(()=>{
    let list = inventory.slice();
    const q = query.trim().toLowerCase();
    if(q){ list = list.filter(v => (v.title+" "+v.make+" "+v.model+" "+v.body+" "+v.fuel+" "+v.location).toLowerCase().includes(q)); }
    if(filters.make) list=list.filter(v=>v.make===filters.make);
    if(filters.body) list=list.filter(v=>v.body===filters.body);
    if(filters.fuel) list=list.filter(v=>v.fuel===filters.fuel);
    if(filters.location) list=list.filter(v=>v.location===filters.location);
    if(filters.transmission) list=list.filter(v=>v.transmission===filters.transmission);
    if(filters.maxPrice) list=list.filter(v=>v.price<=Number(filters.maxPrice));
    if(filters.maxMileage) list=list.filter(v=>v.mileage<=Number(filters.maxMileage));
    if(filters.yearMin) list=list.filter(v=>v.year>=Number(filters.yearMin));
    if(filters.yearMax) list=list.filter(v=>v.year<=Number(filters.yearMax));
    list.sort((a,b)=>{
      if(sortBy==='price-asc') return a.price-b.price;
      if(sortBy==='price-desc') return b.price-a.price;
      if(sortBy==='mileage-asc') return a.mileage-b.mileage;
      if(sortBy==='mileage-desc') return b.mileage-a-mileage;
      if(sortBy==='year-desc') return b.year-a.year;
      if(sortBy==='year-asc') return a.year-b.year;
      return new Date(b.createdAt)-new Date(a.createdAt);
    });
    return list;
  },[inventory, query, filters, sortBy]);

  function handleAdmin(){
    if(isAdmin){ setIsAdmin(false); return; }
    const pass = window.prompt('Enter admin passcode');
    if(pass===ADMIN_PASSCODE) setIsAdmin(true); else alert('Incorrect passcode');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="flex items-center gap-3 text-slate-800">
            {LOGO_DATA_URI ? (
              <img src={LOGO_DATA_URI} alt="Argyll Vehicles Ltd logo" className="h-10 w-auto hidden sm:block"/>
            ) : (
              <div className="p-2 rounded-xl" style={{background:BRAND_PRIMARY, color:'#fff'}}><CarIcon className="w-5 h-5"/></div>
            )}
            <div className="leading-tight">
              <div className="font-semibold text-base md:text-lg">ARGYLL VEHICLES LTD</div>
              <div className="text-xs tracking-wide text-slate-500">HELENSBURGH</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="ml-6 hidden sm:flex gap-2">
            <button onClick={()=>setPage('inventory')} className={`px-3 py-2 rounded-xl text-sm border ${page==='inventory'?'text-white':''}`} style={page==='inventory'?{background:BRAND_PRIMARY,borderColor:BRAND_PRIMARY}:{borderColor:'#e2e8f0'}}>Inventory</button>
            <button onClick={()=>setPage('reviews')} className={`px-3 py-2 rounded-xl text-sm border ${page==='reviews'?'text-white':''}`} style={page==='reviews'?{background:BRAND_PRIMARY,borderColor:BRAND_PRIMARY}:{borderColor:'#e2e8f0'}}>Reviews</button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {BUSINESS_ADDRESS && (
              <a href={mapsDirLink(BUSINESS_ADDRESS)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100">
                <MapPin className="w-4 h-4" /> Directions
              </a>
            )}
            {page==='inventory' && (
              <button className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100" onClick={()=>setFiltersOpen(v=>!v)}>
                <FilterIcon className="w-4 h-4" /> Filters
              </button>
            )}
            <button className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border bg-white" onClick={handleAdmin} style={{borderColor: BRAND_PRIMARY, color: BRAND_PRIMARY}}>
              <Settings className="w-4 h-4" /> {isAdmin? 'Admin (on)':'Admin'}
            </button>
          </div>
        </div>
      </header>

      {page==='inventory' ? (
        <InventoryPage
          inventory={filtered}
          fullInventory={inventory}
          setInventory={setInventory}
          query={query}
          setQuery={setQuery}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isAdmin={isAdmin}
          onSelect={setSelected}
          showAdd={showAdd}
          setShowAdd={setShowAdd}
        />
      ) : (
        <ReviewsPage reviews={reviews} setReviews={setReviews} isAdmin={isAdmin} />
      )}

      {selected && (<DetailsModal vehicle={selected} onClose={()=>setSelected(null)} />)}

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-slate-600 border-t border-slate-200 mt-10">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© {new Date().getFullYear()} Argyll Vehicles Ltd — Helensburgh</p>
          <p>Company Registration: <span className="font-medium">{COMPANY_REG}</span></p>
          <p><a className="underline" href={mapsDirLink(BUSINESS_ADDRESS)} target="_blank" rel="noreferrer">{BUSINESS_ADDRESS}</a></p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a href={waLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 p-4 rounded-full text-white shadow-lg hover:opacity-90" title="Chat on WhatsApp" style={{background:'#22C55E'}}>
        <MessageCircle className="w-6 h-6"/>
      </a>
    </div>
  );
}

// ------------------------- Inventory Page -------------------------
function InventoryPage({inventory,fullInventory,setInventory,query,setQuery,filtersOpen,setFiltersOpen,filters,setFilters,sortBy,setSortBy,isAdmin,onSelect,showAdd,setShowAdd}){
  return (
    <>
      {/* Search & Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:flex-1">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 ring-1 ring-transparent focus-within:ring-slate-300">
            <Search className="w-4 h-4 opacity-60" />
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search make, model, location…" className="w-full bg-transparent outline-none text-sm"/>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Sort by</label>
          <select className="text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="mileage-asc">Mileage: Low to High</option>
            <option value="mileage-desc">Mileage: High to Low</option>
            <option value="year-desc">Year: New to Old</option>
            <option value="year-asc">Year: Old to New</option>
          </select>
          {isAdmin && (
            <button onClick={()=>setShowAdd(true)} className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white" style={{background:BRAND_PRIMARY}}>
              <Plus className="w-4 h-4"/> Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <SelectControl label="Make" value={filters.make} onChange={(v)=>setFilters((f)=>({...f, make:v}))} options={new Set(fullInventory.map(v=>v.make))} />
            <SelectControl label="Body" value={filters.body} onChange={(v)=>setFilters((f)=>({...f, body:v}))} options={new Set(fullInventory.map(v=>v.body))} />
            <SelectControl label="Fuel" value={filters.fuel} onChange={(v)=>setFilters((f)=>({...f, fuel:v}))} options={new Set(fullInventory.map(v=>v.fuel))} />
            <SelectControl label="Transmission" value={filters.transmission} onChange={(v)=>setFilters((f)=>({...f, transmission:v}))} options={new Set(fullInventory.map(v=>v.transmission))} />
            <SelectControl label="Location" value={filters.location} onChange={(v)=>setFilters((f)=>({...f, location:v}))} options={new Set(fullInventory.map(v=>v.location))} />
            <NumberControl label="Max Price (£)" value={filters.maxPrice} onChange={(v)=>setFilters((f)=>({...f, maxPrice:v}))} placeholder="e.g. 20000" />
            <NumberControl label="Max Mileage" value={filters.maxMileage} onChange={(v)=>setFilters((f)=>({...f, maxMileage:v}))} placeholder="e.g. 50000" />
            <NumberControl label="Min Year" value={filters.yearMin} onChange={(v)=>setFilters((f)=>({...f, yearMin:v}))} />
            <NumberControl label="Max Year" value={filters.yearMax} onChange={(v)=>setFilters((f)=>({...f, yearMax:v}))} />
            <div className="col-span-2 flex items-end gap-2">
              <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-sm" onClick={()=>setFilters({ make:"", body:"", fuel:"", transmission:"", maxPrice:"", yearMin:"", yearMax:"", maxMileage:"", location:"" })}>Clear filters</button>
              <div className="text-xs text-slate-500 ml-auto self-center">{fullInventory.length} total</div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {inventory.length===0 ? (
          <div className="text-center py-24">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center"><Search className="w-6 h-6 text-slate-500"/></div>
            <h2 className="mt-4 text-xl font-semibold">No vehicles found</h2>
            <p className="text-slate-600">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {inventory.map(v => (<VehicleCard key={v.id} vehicle={v} isAdmin={isAdmin} onDelete={()=>setInventory(prev=>prev.filter(x=>x.id!==v.id))} onView={()=>onSelect(v)} />))}
          </div>
        )}
      </main>

      {/* Add Vehicle Drawer */}
      {showAdd && isAdmin && (
        <AddVehicleForm onClose={()=>setShowAdd(false)} onAdd={(veh)=>{ 
          const item = { ...veh, id: uid(), createdAt: new Date().toISOString() };
          setInventory(prev=>[item, ...prev]);
          setShowAdd(false);
        }}/>
      )}

      {/* Branding uploader in Admin */}
      {isAdmin && (
        <BrandingPanel />
      )}
    </>
  );
}

// ------------------------- Reviews Page -------------------------
function ReviewsPage({reviews,setReviews,isAdmin}){
  const [form,setForm] = useState({name:'',rating:5,comment:''});
  const [googleUrl, setGoogleUrl] = useState(GOOGLE_REVIEW_URL);

  function addReview(e){
    e.preventDefault();
    if(!form.name || !form.comment) return alert('Please add your name and a short comment.');
    const r = { id: uid(), name: form.name.trim(), rating: Number(form.rating)||5, comment: form.comment.trim(), createdAt: new Date().toISOString(), response:'', approved:false, source:'onsite' };
    setReviews(prev=>[r, ...prev]);
    setForm({name:'',rating:5,comment:''});
    alert('Thanks! Your review was submitted and is awaiting approval.');
  }
  function del(id){ if(!isAdmin) return; setReviews(prev=>prev.filter(r=>r.id!==id)); }
  function saveResponse(id, text){ if(!isAdmin) return; setReviews(prev=>prev.map(r=>r.id===id?{...r, response:text}:r)); }
  function approve(id){ if(!isAdmin) return; setReviews(prev=>prev.map(r=>r.id===id?{...r, approved:true}:r)); }
  function unapprove(id){ if(!isAdmin) return; setReviews(prev=>prev.map(r=>r.id===id?{...r, approved:false}:r)); }
  function saveGoogleUrl(){ try{ localStorage.setItem('car-sales-google-review', googleUrl.trim()); alert('Saved. Visitors will see a \"Review on Google\" button.'); } catch{} }

  const published = reviews.filter(r=>r.approved);
  const pending = reviews.filter(r=>!r.approved);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold">Customer Reviews</h1>
      <p className="text-slate-600 mt-1">We'd love your feedback. It helps us keep improving.</p>

      {/* Google link + Admin controls */}
      {isAdmin && (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200">
          <div className="text-sm font-medium mb-2">Admin · Review Settings</div>
          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Google review link (optional)</div>
            <input value={googleUrl} onChange={(e)=>setGoogleUrl(e.target.value)} placeholder="https://search.google.com/local/writereview?placeid=..." className="w-full px-3 py-2 rounded-xl border border-slate-300"/>
          </label>
          <div className="mt-2 flex gap-2">
            <button onClick={saveGoogleUrl} className="px-3 py-2 rounded-xl text-white" style={{background:BRAND_PRIMARY}}>Save</button>
            <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noreferrer" className="text-xs underline">How to find my Place ID</a>
          </div>
        </div>
      )}

      {/* Leave a review / Google button */}
      <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200">
        {googleUrl && (
          <a href={googleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{background:BRAND_PRIMARY}}>Leave a Google review</a>
        )}
        <div className="mt-4 text-sm text-slate-500">or leave a review below (we'll publish it once approved)</div>
        <form onSubmit={addReview} className="mt-3 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm block"><div className="text-slate-600 mb-1">Your name</div><input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="e.g., Jane D"/></label>
            <label className="text-sm block"><div className="text-slate-600 mb-1">Rating</div><select value={form.rating} onChange={(e)=>setForm({...form,rating:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">{[5,4,3,2,1].map(n=>(<option key={n} value={n}>{n} Star{n>1?'s':''}</option>))}</select></label>
          </div>
          <label className="text-sm block"><div className="text-slate-600 mb-1">Your review</div><textarea value={form.comment} onChange={(e)=>setForm({...form,comment:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-300 h-28" placeholder="How was your experience?"/></label>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{background:BRAND_PRIMARY}}><Plus className="w-4 h-4"/> Submit for approval</button>
        </form>
      </div>

      {/* Pending for admin */}
      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Pending approval</h2>
          <div className="mt-3 space-y-3">
            {pending.length===0 && <div className="text-slate-500 text-sm">No pending reviews.</div>}
            {pending.map(r=> (
              <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-amber-500 flex items-center gap-1 text-sm">{Array.from({length:r.rating}).map((_,i)=>(<Star key={i} className="w-4 h-4 fill-current"/>))}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>approve(r.id)} className="px-3 py-1.5 rounded-lg text-white text-xs" style={{background:BRAND_PRIMARY}}>Approve</button>
                    <button onClick={()=>del(r.id)} className="px-3 py-1.5 rounded-lg border text-xs hover:bg-rose-50 text-rose-600">Delete</button>
                  </div>
                </div>
                <p className="mt-2 text-slate-700 whitespace-pre-wrap">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Published reviews</h2>
        <div className="mt-3 space-y-4">
          {published.length===0 && <div className="text-slate-500 text-sm">No reviews yet.</div>}
          {published.map(r=> (
            <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-amber-500 flex items-center gap-1 text-sm">{Array.from({length:r.rating}).map((_,i)=>(<Star key={i} className="w-4 h-4 fill-current"/>))}</div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={()=>unapprove(r.id)} className="px-3 py-1.5 rounded-lg border text-xs">Unpublish</button>
                    <button onClick={()=>del(r.id)} className="px-3 py-1.5 rounded-lg border text-xs hover:bg-rose-50 text-rose-600">Delete</button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">{r.comment}</p>

              {/* Owner response */}
              {isAdmin ? (
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Your response</div>
                  <textarea defaultValue={r.response} onBlur={(e)=>saveResponse(r.id, e.target.value)} placeholder="Write a reply (saved on click away)" className="w-full px-3 py-2 rounded-xl border border-slate-300 h-20"/>
                </div>
              ) : (
                r.response && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                    <div className="inline-flex items-center gap-1 text-slate-600 mb-1"><Reply className="w-4 h-4"/> Owner response</div>
                    <div className="text-slate-700 whitespace-pre-wrap">{r.response}</div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------- UI Pieces -------------------------
function VehicleCard({ vehicle, isAdmin, onDelete, onView }){
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-slate-100">
        {vehicle.images?.[0] ? (
          <img src={vehicle.images[0]} alt={vehicle.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400"><ImagePlus className="w-10 h-10"/></div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
          <div className="font-bold" style={{color: BRAND_PRIMARY}}>£{formatNumber(vehicle.price)}</div>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-600 gap-3">
          <div className="inline-flex items-center gap-1"><Gauge className="w-4 h-4"/> {formatNumber(vehicle.mileage)} mi</div>
          <div className="inline-flex items-center gap-1"><Calendar className="w-4 h-4"/> {vehicle.year}</div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={onView} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-sm">View details</button>
          {isAdmin ? (
            <button onClick={onDelete} className="px-3 py-2 text-sm rounded-xl border hover:bg-rose-50 text-rose-600 inline-flex items-center gap-1"><Trash className="w-4 h-4"/> Delete</button>
          ) : (
            <a href={mapsDirLink(BUSINESS_ADDRESS)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm rounded-xl text-white inline-flex items-center gap-1" style={{background: BRAND_PRIMARY}}><Navigation className="w-4 h-4"/> Directions</a>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectControl({ label, value, onChange, options }){
  const opts = ["", ...Array.from(options||[])];
  return (
    <label className="text-sm">
      <div className="text-slate-600 mb-1">{label}</div>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
        {opts.map(opt => (<option key={String(opt)} value={opt}>{opt||'Any'}</option>))}
      </select>
    </label>
  );
}

function NumberControl({ label, value, onChange, placeholder }){
  return (
    <label className="text-sm">
      <div className="text-slate-600 mb-1">{label}</div>
      <input type="number" value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white" />
    </label>
  );
}

function DetailsModal({ vehicle, onClose }){
  const [i, setI] = useState(0);
  const imgs = vehicle.images && vehicle.images.length ? vehicle.images : ["https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"]; 
  useEffect(()=>setI(0),[vehicle.id]);
  function prev(){ setI(p => (p-1+imgs.length)%imgs.length); }
  function next(){ setI(p => (p+1)%imgs.length); }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-[95vw] max-w-4xl shadow-xl border border-slate-200 overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 border border-slate-200 hover:bg-slate-50 z-10"><X className="w-5 h-5"/></button>

        <div className="grid md:grid-cols-2">
          <div className="relative h-72 md:h-full bg-slate-100">
            <img src={imgs[i]} alt={vehicle.title} className="absolute inset-0 w-full h-full object-cover" />
            {imgs.length>1 && (<>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/90 border border-slate-200 hover:bg-slate-50">‹</button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/90 border border-slate-200 hover:bg-slate-50">›</button>
            </>)}
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
            <div className="mt-3 text-2xl font-bold" style={{color: BRAND_PRIMARY}}>£{formatNumber(vehicle.price)}</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Spec label="Mileage" value={`${formatNumber(vehicle.mileage)} mi`} icon={<Gauge className="w-4 h-4"/>} />
              <Spec label="Year" value={vehicle.year} icon={<Calendar className="w-4 h-4"/>} />
              <Spec label="Fuel" value={vehicle.fuel} icon={<Fuel className="w-4 h-4"/>} />
              <Spec label="Transmission" value={vehicle.transmission} />
              <Spec label="Body" value={vehicle.body} />
              <Spec label="Location" value={vehicle.location} icon={<MapPin className="w-4 h-4"/>} />
              <Spec label="Colour" value={vehicle.color} />
              <Spec label="VIN" value={vehicle.vin} icon={<Hash className="w-4 h-4"/>} />
            </div>
            <p className="mt-4 text-sm text-slate-700 whitespace-pre-wrap">{vehicle.description}</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
              <a href={mapsDirLink(BUSINESS_ADDRESS)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-center">Directions</a>
              <a href={waLink(WHATSAPP_NUMBER, `Hi, I'm interested in the ${vehicle.title} for £${vehicle.price}. Is it available?`)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-white text-center" style={{background:'#22C55E'}}>WhatsApp</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Spec({ label, value, icon }){
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500">{icon} {label}</div>
      <div className="mt-1 text-sm font-medium">{value || '—'}</div>
    </div>
  );
}

// ------------------------- Add Vehicle & Branding -------------------------
function AddVehicleForm({ onAdd, onClose }){
  const [v, setV] = useState({
    title: "",
    make: "", model:"", year: new Date().getFullYear(),
    price: "", mileage:"",
    body:"", fuel:"", transmission:"",
    location:"Helensburgh",
    color:"", vin:"",
    description:"",
    images: [],
  });

  function addFile(e){
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => setV((curr)=>({...curr, images:[...(curr.images||[]), reader.result]}));
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  function addImageUrl(){
    const url = prompt("Paste image URL");
    if(url) setV(curr=>({...curr, images:[...(curr.images||[]), url]}));
  }
  function removeImage(i){
    setV(curr=>({...curr, images: curr.images.filter((_,idx)=>idx!==i)}));
  }

  function save(e){
    e.preventDefault();
    if(!v.make || !v.model || !v.price) return alert("Please fill make, model and price.");
    onAdd({
      ...v,
      price: Number(v.price||0),
      mileage: Number(v.mileage||0),
      year: Number(v.year||new Date().getFullYear()),
      title: v.title || `${v.year} ${v.make} ${v.model}`,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative bg-white w-full sm:w-[680px] max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Vehicle</h3>
          <button onClick={onClose} className="p-2 rounded-xl border"><X className="w-4 h-4"/></button>
        </div>

        <form onSubmit={save} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Text label="Make" value={v.make} onChange={(x)=>setV({...v, make:x})}/>
          <Text label="Model" value={v.model} onChange={(x)=>setV({...v, model:x})}/>
          <Number label="Year" value={v.year} onChange={(x)=>setV({...v, year:x})}/>
          <Number label="Price (£)" value={v.price} onChange={(x)=>setV({...v, price:x})}/>
          <Number label="Mileage" value={v.mileage} onChange={(x)=>setV({...v, mileage:x})}/>
          <Text label="Body" value={v.body} onChange={(x)=>setV({...v, body:x})}/>
          <Text label="Fuel" value={v.fuel} onChange={(x)=>setV({...v, fuel:x})}/>
          <Text label="Transmission" value={v.transmission} onChange={(x)=>setV({...v, transmission:x})}/>
          <Text label="Location" value={v.location} onChange={(x)=>setV({...v, location:x})}/>
          <Text label="Colour" value={v.color} onChange={(x)=>setV({...v, color:x})}/>
          <Text label="VIN" value={v.vin} onChange={(x)=>setV({...v, vin:x})}/>
          <label className="sm:col-span-2 text-sm">
            <div className="text-slate-600 mb-1">Description</div>
            <textarea value={v.description} onChange={(e)=>setV({...v, description:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-300 h-28" placeholder="Notes or features"/>
          </label>

          <div className="sm:col-span-2">
            <div className="text-slate-600 mb-1 text-sm">Images</div>
            <div className="flex gap-2">
              <input type="file" accept="image/*" onChange={addFile} className="text-sm"/>
              <button type="button" onClick={addImageUrl} className="px-3 py-2 rounded-xl border text-sm">Add from URL</button>
            </div>
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(v.images||[]).map((img,idx)=>(
                <div key={idx} className="relative rounded-xl overflow-hidden border">
                  <img src={img} className="w-full h-24 object-cover"/>
                  <button type="button" onClick={()=>removeImage(idx)} className="absolute top-1 right-1 px-2 py-0.5 rounded-lg bg-white/90 border text-xs">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 mt-2 flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
            <button className="px-4 py-2 rounded-xl text-white" style={{background:BRAND_PRIMARY}}>Save Vehicle</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BrandingPanel(){
  const [existing, setExisting] = useState(()=>{
    try { return localStorage.getItem('car-sales-brand-logo') || ""; } catch { return ""; }
  });
  function onFile(e){
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem('car-sales-brand-logo', reader.result);
        setExisting(reader.result);
        alert('Logo saved. Refresh to apply.');
        window.location.reload();
      } catch(err){
        alert('Could not save logo in this browser.');
      }
    };
    reader.readAsDataURL(file);
  }
  function clearLogo(){
    try {
      localStorage.removeItem('car-sales-brand-logo');
      alert('Logo removed. Refreshing to apply.');
      window.location.reload();
    } catch{}
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
      <div className="p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Branding</div>
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={onFile} className="text-sm" />
            {existing && <button onClick={clearLogo} className="px-3 py-2 rounded-xl border text-sm">Remove</button>}
          </div>
        </div>
        <div className="mt-3 w-40 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
          {existing ? <img src={existing} alt="Logo" className="max-h-full"/> : <span className="text-xs text-slate-500">No logo uploaded</span>}
        </div>
      </div>
    </div>
  );
}

// Small input helpers
function Text({label, value, onChange}){
  return (
    <label className="text-sm">
      <div className="text-slate-600 mb-1">{label}</div>
      <input value={value} onChange={(e)=>onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
    </label>
  );
}
function Number({label, value, onChange}){
  return (
    <label className="text-sm">
      <div className="text-slate-600 mb-1">{label}</div>
      <input type="number" value={value} onChange={(e)=>onChange(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
    </label>
  );
}
