import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function App(){
  const [file, setFile] = useState(null)
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState('')
  const [streamKey, setStreamKey] = useState('')
  const [status, setStatus] = useState({running:false})

  useEffect(()=>{ fetchVideos(); fetchStatus(); }, [])

  async function fetchVideos(){
    const res = await axios.get('/api/videos');
    setVideos(res.data);
  }

  async function fetchStatus(){
    const res = await axios.get('/api/status');
    setStatus(res.data);
  }

  async function upload(e){
    e.preventDefault();
    if(!file) return alert('اختر ملفاً');
    const fd = new FormData();
    fd.append('video', file);
    await axios.post('/api/upload', fd);
    await fetchVideos();
    alert('Uploaded');
  }

  async function start(){
    await axios.post('/api/start', { streamKey, filename: selected || undefined });
    fetchStatus();
  }

  async function stop(){
    await axios.post('/api/stop');
    fetchStatus();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">YouTube 24/7 Streamer</h1>

        <section className="mb-4">
          <label className="block mb-2">مفتاح البث (Stream Key)</label>
          <input className="w-full border p-2" value={streamKey} onChange={e=>setStreamKey(e.target.value)} placeholder="يعتبر حقلاً إلزامياً عند بدء البث إذا لم تُضع في .env" />
        </section>

        <section className="mb-4">
          <form onSubmit={upload}>
            <label className="block mb-2">رفع فيديو</label>
            <input type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])} />
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded" type="submit">رفع</button>
          </form>
        </section>

        <section className="mb-4">
          <label className="block mb-2">قائمة الفيديوهات على السيرفر</label>
          <select className="w-full border p-2" value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">-- اختر ملفاً --</option>
            {videos.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </section>

        <section className="flex gap-3">
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={start}>ابدأ البث</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={stop}>أوقف البث</button>
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={fetchStatus}>تحديث الحالة</button>
        </section>

        <div className="mt-4">
          <strong>حالة:</strong> {status.running ? 'بث يعمل' : 'متوقف'}
        </div>
      </div>
    </div>
  )
}
