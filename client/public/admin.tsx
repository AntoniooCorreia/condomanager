import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = 'motorodri2024';

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  power: number;
  description: string;
  main_image: string;
  gallery_images: string[];
  featured: boolean;
  status: string;
  reserved: boolean;
  category: string;
};

const emptyForm = {
  brand: '', model: '', year: '', price: '', mileage: '',
  fuel_type: '', transmission: '', power: '', description: '',
  featured: false, status: 'available', category: '', reserved: false
};

type PreviewImage = { type: 'existing'; url: string } | { type: 'new'; url: string; file: File };

function ImageGrid({
  allPreviewImages,
  existingImages,
  newImages,
  setExistingImages,
  setNewImages,
}: {
  allPreviewImages: PreviewImage[];
  existingImages: string[];
  newImages: File[];
  setExistingImages: (v: string[]) => void;
  setNewImages: (v: File[]) => void;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const touchDragIndex = useRef<number | null>(null);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const indices = allPreviewImages.map((_, i) => i);
    const reordered = [...indices];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const newExisting: string[] = [];
    const newNew: File[] = [];
    reordered.forEach(idx => {
      if (idx < existingImages.length) newExisting.push(existingImages[idx]);
      else newNew.push(newImages[idx - existingImages.length]);
    });
    setExistingImages(newExisting);
    setNewImages(newNew);
  };

  const removeImage = (i: number) => {
    if (i < existingImages.length) {
      setExistingImages(existingImages.filter((_, idx) => idx !== i));
    } else {
      setNewImages(newImages.filter((_, idx) => idx !== i - existingImages.length));
    }
  };

  const onTouchStart = (e: React.TouchEvent, index: number) => {
    touchDragIndex.current = index;
    setDraggingIndex(index);
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const ghost = target.cloneNode(true) as HTMLDivElement;
    ghost.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      height: ${rect.height}px;
      top: ${rect.top}px;
      left: ${rect.left}px;
      opacity: 0.85;
      pointer-events: none;
      z-index: 9999;
      border-radius: 8px;
      transform: scale(1.08);
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    `;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!ghostRef.current) return;
    const touch = e.touches[0];
    const rect = ghostRef.current.getBoundingClientRect();
    ghostRef.current.style.left = `${touch.clientX - rect.width / 2}px`;
    ghostRef.current.style.top = `${touch.clientY - rect.height / 2}px`;
    ghostRef.current.style.display = 'none';
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    ghostRef.current.style.display = '';
    const imageEl = el?.closest('[data-image-index]');
    if (imageEl) {
      const overIndex = parseInt(imageEl.getAttribute('data-image-index') || '-1');
      if (overIndex >= 0) setDragOverIndex(overIndex);
    }
  };

  const onTouchEnd = () => {
    if (ghostRef.current) { ghostRef.current.remove(); ghostRef.current = null; }
    if (touchDragIndex.current !== null && dragOverIndex !== null) {
      reorder(touchDragIndex.current, dragOverIndex);
    }
    touchDragIndex.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
      {allPreviewImages.map((img, i) => (
        <div
          key={i}
          data-image-index={i}
          draggable
          onDragStart={() => setDraggingIndex(i)}
          onDragOver={e => { e.preventDefault(); setDragOverIndex(i); }}
          onDragEnd={() => {
            if (draggingIndex !== null && dragOverIndex !== null) reorder(draggingIndex, dragOverIndex);
            setDraggingIndex(null);
            setDragOverIndex(null);
          }}
          onTouchStart={e => onTouchStart(e, i)}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transition: 'transform 0.15s, opacity 0.15s, outline 0.1s',
            transform: draggingIndex === i ? 'scale(0.93)' : dragOverIndex === i && draggingIndex !== i ? 'scale(1.06)' : 'scale(1)',
            opacity: draggingIndex === i ? 0.35 : 1,
            outline: dragOverIndex === i && draggingIndex !== i ? '2px solid #FF6B35' : 'none',
            outlineOffset: '2px',
          }}
          className={`relative rounded-lg overflow-hidden cursor-grab aspect-square select-none touch-none ${i === 0 ? 'ring-2 ring-[#FF6B35]' : ''}`}
        >
          <img src={img.url} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
          {i === 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#FF6B35] text-white text-xs text-center py-1 font-bold pointer-events-none">
              Foto de capa
            </div>
          )}
          {img.type === 'existing' && (
            <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1 rounded pointer-events-none">atual</div>
          )}
          <button
            onClick={() => removeImage(i)}
            className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600 z-10"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'add' | 'manage'>('add');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [message, setMessage] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'inactive' | 'sold'>('all');

  useEffect(() => {
    if (auth && tab === 'manage') fetchCars();
  }, [auth, tab]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
    setNewImages(prev => [...prev, ...imgs]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    addFiles(e.clipboardData.files);
  }, []);

  const fetchCars = async () => {
    const { data } = await supabase.from('motorcycles').select('*').order('created_at', { ascending: false });
    setCars(data || []);
  };

  const scrape = async () => {
    if (!url) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.error) { setMessage('Erro: ' + data.error); return; }
      setForm({
        ...form,
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || '',
        price: data.price || '',
        mileage: data.mileage || '',
        fuel_type: data.fuel_type || '',
        transmission: data.transmission || '',
        power: data.power || '',
        description: data.description || '',
        featured: false,
        status: 'available',
        category: ''
      });
      if (data.gallery_images?.length > 0) {
        setExistingImages(data.gallery_images);
      }
      setMessage('✅ Dados importados com sucesso!');
    } catch {
      setMessage('Erro ao importar dados.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of newImages) {
      const ext = file.type.split('/')[1] || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('motorcycles').upload(filename, file, { upsert: true, contentType: file.type });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from('motorcycles').getPublicUrl(filename);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const save = async () => {
    if (newImages.length === 0 && existingImages.length === 0) {
      setMessage('Adiciona pelo menos uma imagem.');
      return;
    }
    if (!form.category) {
      setMessage('Seleciona se a moto é Moderna ou Clássica.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const uploadedUrls = await uploadImages();
      const allImages = [...existingImages, ...uploadedUrls];
      if (editingId) {
        const { error } = await supabase.from('motorcycles').update({
          ...form,
          year: parseInt(form.year),
          price: parseFloat(form.price),
          mileage: parseInt(form.mileage),
          power: parseInt(form.power),
          main_image: allImages[0],
          gallery_images: allImages,
        }).eq('id', editingId);
        if (error) throw error;
        setMessage('✅ Moto atualizada com sucesso!');
        setEditingId(null);
        fetchCars();
        setTab('manage');
      } else {
        const { error } = await supabase.from('motorcycles').insert([{
          ...form,
          year: parseInt(form.year),
          price: parseFloat(form.price),
          mileage: parseInt(form.mileage),
          power: parseInt(form.power),
          main_image: allImages[0],
          gallery_images: allImages,
        }]);
        if (error) throw error;
        setMessage('✅ Moto adicionada com sucesso!');
      }
      setForm(emptyForm);
      setNewImages([]);
      setExistingImages([]);
      setUrl('');
    } catch (err: any) {
      setMessage('Erro ao guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (car: Car) => {
    setEditingId(car.id);
    setForm({
      brand: car.brand, model: car.model, year: car.year, price: car.price,
      mileage: car.mileage, fuel_type: car.fuel_type, transmission: car.transmission,
      power: car.power, description: car.description, featured: car.featured,
      status: car.status, category: car.category || ''
    });
    setExistingImages(car.gallery_images || (car.main_image ? [car.main_image] : []));
    setNewImages([]);
    setMessage('');
    setTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStatus = async (id: string, status: string) => {
    const updateData: any = { status };
    if (status === 'sold') {
      updateData.featured = false;
      updateData.reserved = false;
    }
    const { error } = await supabase.from('motorcycles').update(updateData).eq('id', id);
    if (error) { alert('Erro ao atualizar: ' + error.message); return; }
    await fetchCars();
  };

  const deleteCar = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta moto?')) return;
    const { error } = await supabase.from('motorcycles').delete().eq('id', id);
    if (error) { alert('Erro ao eliminar: ' + error.message); return; }
    await fetchCars();
  };

  const field = (label: string, key: string, type = 'text') => (
    <div>
      <label className="text-[#B8B8B8] text-sm mb-1 block">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded"
      />
    </div>
  );

  const filteredCars = cars.filter(c => filter === 'all' ? true : c.status === filter);
  const statusLabel: any = { available: 'Disponível', inactive: 'Inativo', sold: 'Vendido' };
  const statusColor: any = { available: 'text-green-400', inactive: 'text-yellow-400', sold: 'text-red-400' };

  const allPreviewImages: PreviewImage[] = [
    ...existingImages.map(url => ({ type: 'existing' as const, url })),
    ...newImages.map(file => ({ type: 'new' as const, url: URL.createObjectURL(file), file }))
  ];

  if (!auth) return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center pt-24">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-full max-sm:max-w-[90%] max-w-sm">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Admin</h1>
        <input
          type="password"
          placeholder="Password"
          className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setAuth(password === ADMIN_PASSWORD)}
        />
        <button onClick={() => setAuth(password === ADMIN_PASSWORD)}
          className="w-full bg-[#FF6B35] text-white py-3 rounded font-bold hover:bg-[#FF8555]">
          Entrar
        </button>
        {password && !auth && <p className="text-red-400 text-sm mt-2 text-center">Password incorreta</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-28 pb-12 px-4" onPaste={onPaste}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Painel Admin</h1>

        <div className="flex gap-2 mb-8">
          <button onClick={() => { setTab('add'); setEditingId(null); setForm(emptyForm); setNewImages([]); setExistingImages([]); setMessage(''); }}
            className={`px-6 py-2 rounded font-bold transition-colors ${tab === 'add' ? 'bg-[#FF6B35] text-white' : 'bg-[#1a1a1a] text-[#B8B8B8] hover:text-white'}`}>
            {editingId ? '✏️ Editar Moto' : '+ Adicionar Moto'}
          </button>
          <button onClick={() => { setTab('manage'); fetchCars(); }}
            className={`px-6 py-2 rounded font-bold transition-colors ${tab === 'manage' ? 'bg-[#FF6B35] text-white' : 'bg-[#1a1a1a] text-[#B8B8B8] hover:text-white'}`}>
            Gerir Anúncios
          </button>
        </div>

        {tab === 'add' && (
          <>
            {!editingId && (
              <div className="bg-[#1a1a1a] p-6 rounded-lg mb-8">
                <h2 className="text-[#FF6B35] font-bold text-lg mb-4">Importar do Standvirtual</h2>
                <div className="flex gap-3">
                  <input type="text" placeholder="https://www.standvirtual.com/motos/anuncio/..."
                    value={url} onChange={e => setUrl(e.target.value)}
                    className="flex-1 bg-[#2a2a2a] text-white px-4 py-2 rounded" />
                  <button onClick={scrape} disabled={loading}
                    className="bg-[#FF6B35] text-white px-6 py-2 rounded font-bold hover:bg-[#FF8555] disabled:opacity-50">
                    {loading ? '...' : 'Importar'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#1a1a1a] p-6 rounded-lg mb-8">
              <h2 className="text-white font-bold text-lg mb-2">Imagens</h2>
              <p className="text-[#B8B8B8] text-sm mb-4">Arrasta para reordenar — a primeira é a foto de capa</p>
              {allPreviewImages.length > 0 && (
                <ImageGrid
                  allPreviewImages={allPreviewImages}
                  existingImages={existingImages}
                  newImages={newImages}
                  setExistingImages={setExistingImages}
                  setNewImages={setNewImages}
                />
              )}
              <div
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('fileInput')?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-[#FF6B35] bg-[#FF6B35]/10' : 'border-[#444] hover:border-[#FF6B35]'}`}
              >
                <p className="text-[#B8B8B8] text-sm">Arrasta novas imagens aqui, cola (Ctrl+V) ou clica para selecionar</p>
                <input id="fileInput" type="file" multiple accept="image/*" className="hidden"
                  onChange={e => addFiles(e.target.files)} />
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-lg space-y-4">
              <h2 className="text-white font-bold text-lg mb-2">Detalhes da Moto</h2>

              <div className="grid grid-cols-2 gap-4">
                {field('Marca', 'brand')}
                {field('Modelo', 'model')}
                {field('Ano', 'year', 'number')}
                {field('Preço (€)', 'price', 'number')}
                {field('Quilómetros', 'mileage', 'number')}
                {field('Combustível', 'fuel_type')}
                {field('Transmissão', 'transmission')}
                {field('Potência (cc)', 'power', 'number')}
              </div>

              {/* Descrição */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#B8B8B8] text-sm">Descrição</label>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      if (!form.brand || !form.model) {
                        setMessage('Preenche pelo menos a marca e o modelo primeiro.');
                        return;
                      }
                      setLoading(true);
                      setMessage('');
                      try {
                        const res = await fetch('/api/gemini', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            brand: form.brand,
                            model: form.model,
                            year: form.year,
                            mileage: form.mileage,
                            fuel_type: form.fuel_type,
                            transmission: form.transmission,
                            power: form.power,
                            price: form.price,
                          })
                        });
                        const data = await res.json();
                        if (data.error) { setMessage('Erro IA: ' + data.error); return; }
                        setForm({ ...form, description: data.description });
                        setMessage('✅ Descrição gerada pela IA!');
                      } catch {
                        setMessage('Erro ao contactar a IA.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="flex items-center gap-1 bg-purple-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    ✨ Descrição IA
                  </button>
                </div>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-[#B8B8B8] text-sm mb-1 block">
                  Categoria <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className={`bg-[#2a2a2a] text-white px-4 py-2 rounded w-full ${!form.category ? 'border border-red-500' : ''}`}
                >
                  <option value="">-- Seleciona --</option>
                  <option value="moderna">Moderna</option>
                  <option value="classica">Clássica</option>
                </select>
                {!form.category && <p className="text-red-400 text-xs mt-1">Obrigatório selecionar uma categoria</p>}
              </div>

              {message && <p className={`text-sm font-medium ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}

              <div className="flex gap-3">
                {editingId && (
                  <button onClick={() => { setEditingId(null); setForm(emptyForm); setNewImages([]); setExistingImages([]); setMessage(''); }}
                    className="flex-1 bg-[#2a2a2a] text-white py-3 rounded font-bold hover:bg-[#3a3a3a]">
                    Cancelar
                  </button>
                )}
                <button onClick={save} disabled={loading}
                  className="flex-1 bg-[#FF6B35] text-white py-3 rounded font-bold hover:bg-[#FF8555] disabled:opacity-50">
                  {loading ? 'A guardar...' : editingId ? 'Atualizar Moto' : 'Guardar Moto'}
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'manage' && (
          <div className="bg-[#1a1a1a] p-6 rounded-lg">
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'available', 'inactive', 'sold'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1 rounded text-sm font-medium transition-colors ${filter === f ? 'bg-[#FF6B35] text-white' : 'bg-[#2a2a2a] text-[#B8B8B8] hover:text-white'}`}>
                  {f === 'all' ? 'Todos' : statusLabel[f]}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredCars.length === 0 && <p className="text-[#B8B8B8] text-center py-8">Nenhum anúncio encontrado.</p>}
              {filteredCars.map(car => (
                <div key={car.id} className="flex gap-4 bg-[#2a2a2a] rounded-lg p-4 items-center">
                  <img src={car.main_image} alt="" className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{car.brand} {car.model} {car.year}</p>
                    <p className="text-[#FF6B35] font-medium">{car.price?.toLocaleString()}€</p>
                    <div className="flex gap-2">
                      <p className={`text-xs font-medium ${statusColor[car.status] || 'text-gray-400'}`}>
                        {statusLabel[car.status] || car.status}
                      </p>
                      <p className="text-[#B8B8B8] text-xs">
                        | {car.category === 'moderna' ? 'Moderna' : 'Clássica'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(car)}
                      className="bg-[#FF6B35] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#FF8555]">
                      Editar
                    </button>
                    {car.status !== 'inactive' ? (
                      <button onClick={() => updateStatus(car.id, 'inactive')}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-500">
                        Desativar
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(car.id, 'available')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-500">
                        Ativar
                      </button>
                    )}
                    {car.status !== 'sold' ? (
                      <button onClick={() => updateStatus(car.id, 'sold')}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-400">
                        Vendido
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(car.id, 'available')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-500">
                        Reverter
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from('motorcycles').update({ reserved: !car.reserved }).eq('id', car.id);
                        if (error) { alert('Erro: ' + error.message); return; }
                        fetchCars();
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${car.reserved ? 'bg-yellow-500 text-white hover:bg-yellow-400' : 'bg-yellow-700 text-white hover:bg-yellow-600'}`}>
                      {car.reserved ? 'Remover Reserva' : 'Reservado'}
                    </button>
                    <button onClick={() => deleteCar(car.id)}
                      className="bg-red-700 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
