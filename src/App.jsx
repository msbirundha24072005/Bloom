import { useState } from "react"

function App() {
  const [mood, setMood] = useState("")
  const [stress, setStress] = useState(5)
  const [sleep, setSleep] = useState(7)
  const [symptoms, setSymptoms] = useState([])
  const [journal, setJournal] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [activeNav, setActiveNav] = useState("home")
  const [aiTip, setAiTip] = useState("")

  const moodOptions = [
    { emoji: "😄", label: "Mentally Calm" },
    { emoji: "😤", label: "Overwhelmed" },
    { emoji: "😟", label: "Stressed" },
    { emoji: "😴", label: "Low Energy" },
    { emoji: "😊", label: "Focused" },
  ]

  const symptomOptions = ["🧠 Brain Fog", "⚡ Low Energy", "🎯 Focus Drop", "🍽️ Appetite Low", "🤒 Fever", "🤧 Cold"]

  const getTip = () => {
    if (stress >= 8) return "🔴 Try a 2-min breathing exercise right now!"
    if (stress >= 5) return "🟡 Take short breaks, drink water!"
    return "🟢 You're doing great! Keep it up!"
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, stress, sleep, symptoms, journal })
      })
      const data = await response.json()
      console.log(data)
      setAiTip(data.ai_tip)
    } catch (error) {
      console.log("Flask not connected, using local tip!")
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg, #e8f4fd 0%, #c8e6f9 100%)" }}>
        <div className="bg-white rounded-3xl p-10 shadow-xl text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-in Complete!</h2>
          <p className="text-gray-400 text-sm mb-4">{today}</p>
          <div className="rounded-2xl p-4 mb-6" style={{ background: "#e8f4fd" }}>
            <p className="text-gray-600 text-sm">{aiTip || getTip()}</p>
          </div>
          <button onClick={() => { setSubmitted(false); setMood(""); setSymptoms([]); setJournal(""); setAiTip("") }}
            className="w-full py-3 rounded-full text-white font-semibold"
            style={{ background: "#4aa8d8" }}>
            New Check-in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg, #e8f4fd 0%, #c8e6f9 100%)" }}>

      {/* Header */}
      <div className="text-center pt-10 pb-6 px-6">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
          <span className="text-2xl">🌿</span>
        </div>
        <p className="text-gray-400 text-sm">Good evening, Birundha</p>
        <h1 className="text-3xl font-bold text-gray-800 mt-1">How are you really<br />feeling today?</h1>
        <p className="text-sm mt-2 font-medium" style={{ color: "#4aa8d8" }}>{today}</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl mx-auto mb-6"
        style={{ maxWidth: "600px", width: "90%" }}>

        {/* Mood */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">AI Mood Scan</p>
        <div className="space-y-2 mb-6">
          {moodOptions.map((m) => (
            <button key={m.label} onClick={() => setMood(m.label)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all"
              style={{
                borderColor: mood === m.label ? "#4aa8d8" : "#f0f0f0",
                background: mood === m.label ? "#e8f4fd" : "white"
              }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-gray-700 font-medium">{m.label}</span>
              </div>
              {mood === m.label && <span className="font-bold" style={{ color: "#4aa8d8" }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Symptoms */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Today's Signals</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {symptomOptions.map((s) => (
            <button key={s}
              onClick={() => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
              className="px-3 py-2 rounded-xl text-sm text-left transition-all"
              style={{
                background: symptoms.includes(s) ? "#e8f4fd" : "#f8f8f8",
                color: symptoms.includes(s) ? "#4aa8d8" : "#666",
                fontWeight: symptoms.includes(s) ? "600" : "400"
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Stress */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Stress Level</p>
        <div className="rounded-2xl p-4 mb-4" style={{ background: "#f8fbfe" }}>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Calm</span>
            <span className="font-bold" style={{ color: "#4aa8d8" }}>{stress}/10</span>
            <span>Intense</span>
          </div>
          <input type="range" min="1" max="10" value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full accent-blue-400" />
        </div>

        {/* Sleep */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Sleep</p>
        <div className="rounded-2xl p-4 mb-4" style={{ background: "#f8fbfe" }}>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>1 hr</span>
            <span className="font-bold" style={{ color: "#4aa8d8" }}>{sleep} hrs</span>
            <span>12 hrs</span>
          </div>
          <input type="range" min="1" max="12" value={sleep}
            onChange={(e) => setSleep(Number(e.target.value))}
            className="w-full accent-blue-400" />
        </div>

        {/* Journal */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Journal Entry</p>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder="How was your day? Write anything..."
          className="w-full rounded-2xl p-4 text-sm text-gray-600 resize-none outline-none border mb-6"
          style={{ background: "#f8fbfe", borderColor: "#e8f4fd" }}
          rows={3} />

        {/* Submit */}
        <button onClick={handleSubmit}
          className="w-full py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-90"
          style={{ background: "#4aa8d8" }}>
          Start My Check-in 🌿
        </button>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-6 shadow-lg">
        {[
          { icon: "🏠", label: "Home", key: "home" },
          { icon: "📊", label: "Insights", key: "insights" },
          { icon: "💚", label: "Wellness", key: "wellness" },
          { icon: "👤", label: "Profile", key: "profile" },
        ].map((nav) => (
          <button key={nav.key} onClick={() => setActiveNav(nav.key)}
            className="flex flex-col items-center gap-1">
            <span className="text-xl">{nav.icon}</span>
            <span className="text-xs font-medium"
              style={{ color: activeNav === nav.key ? "#4aa8d8" : "#999" }}>
              {nav.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  )
}

export default App