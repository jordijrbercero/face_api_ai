"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
// CAMBIO: Se eliminó Ufo y se aseguró que Rocket esté presente
import { 
  ShieldCheck, ScanFace, UserPlus, LogIn, Trash2, 
  Orbit, Cpu, Activity, Ghost, Zap, Navigation,
  Terminal, Radio, Database, BrainCircuit, Fingerprint,
  Target, AlertCircle, Eye, Rocket 
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "scanning" | "success" | "error";

interface PsychProfile {
  type: string;
  threatLevel: number;
  origin: string;
  description: string;
}

export default function WinnerTerminalV3() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [hasRegisteredFace, setHasRegisteredFace] = useState(false);
  const [logs, setLogs] = useState<string[]>(["CORE_INIT", "AWAITING_BIO_LINK"]);
  const [profile, setProfile] = useState<PsychProfile | null>(null);

  const [isAbducted, setIsAbducted] = useState(false);
  const [abductionPulse, setAbductionPulse] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);
  };

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem("face_descriptor_demo") : null;
    setHasRegisteredFace(!!stored);
    loadModels();
  }, []);

  const loadModels = async () => {
    addLog("DOWNLOAD_NEURAL_MODELS...");
    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      addLog("MODELS_MOUNTED_VRAM");
    } catch (e) {
      setError("INIT_FAIL");
      addLog("ERROR_LOADING_MODELS");
    }
  };

  const generateAIAnalysis = (descriptor: Float32Array) => {
    const val = Math.abs(descriptor[0] * 1000);
    const origins = ["Andromeda Sector", "Nebula-X", "Kepler-186f", "Mars-Underground"];
    const types = ["Bio-Mechanical", "Energy-Based", "Carbon-Hybrid", "Technomancer"];
    return {
      type: types[Math.floor(val % types.length)],
      threatLevel: (val * 7) % 100,
      origin: origins[Math.floor(val % origins.length)],
      description: "Subject shows high synaptic activity. Monitor closely for neural spikes."
    };
  };

  const handleAbduction = () => {
    setAbductionPulse(true);
    addLog("WARNING: TRACTOR_BEAM_INITIALIZED");
    
    // Audio sintético
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 2);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 2.5);
    } catch (e) {
      console.log("Audio not supported");
    }

    setTimeout(() => {
      setIsAbducted(true);
    }, 2500);
  };

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (e) {
      setError("SENSOR_OFFLINE");
    }
  }, []);

  useEffect(() => { initializeCamera(); }, [initializeCamera]);

  const capture = async (type: "save" | "login") => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;
    setStatus("scanning");
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    await new Promise(r => setTimeout(r, 2200));
    const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (!detection) { setStatus("error"); setError("TARGET_LOST"); return; }
    const aiResult = generateAIAnalysis(detection.descriptor);
    setProfile(aiResult);
    if (type === "save") {
      localStorage.setItem("face_descriptor_demo", JSON.stringify(Array.from(detection.descriptor)));
      setHasRegisteredFace(true);
      setStatus("success");
      setInfo("DNA_ENCODED");
    } else {
      const stored = localStorage.getItem("face_descriptor_demo");
      const dist = faceapi.euclideanDistance(JSON.parse(stored || "[]"), Array.from(detection.descriptor));
      setDistance(dist);
      if (dist < 0.55) { setStatus("success"); setInfo("ACCESS_VALID"); } 
      else { setStatus("error"); setError("IMPOSTOR_ALARM"); }
    }
    setTimeout(() => { setStatus("idle"); setDistance(null); }, 7000);
  };

  if (!mounted) return <div className="min-h-screen bg-[#020205]" />;

  if (isAbducted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center animate-pulse">
        <div className="text-black font-mono text-center">
          <Rocket size={100} className="mx-auto mb-4 animate-bounce rotate-[-45deg]" />
          <h1 className="text-4xl font-black italic tracking-tighter">SUBJECT_ABDUCTED</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.5em]">Thank you for your biological data</p>
          <button onClick={() => window.location.reload()} className="mt-10 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all font-bold">REBOOT_SYSTEM</button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#010103] text-lime-400 font-mono p-2 md:p-6 flex flex-col items-center justify-center overflow-hidden relative transition-all duration-1000",
      abductionPulse && "bg-white scale-110"
    )}>
      
      {/* CAPA ESPACIAL */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150" />
        <div className="absolute top-[20%] left-[10%] animate-float-slow opacity-10"><Ghost size={200} /></div>
      </div>

      <main className={cn(
        "relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-300",
        abductionPulse && "animate-shake blur-[2px]"
      )}>
        
        {/* PANEL IZQUIERDO */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="border border-lime-500/20 bg-black/60 p-4 backdrop-blur-md">
            <h3 className="text-[10px] font-bold text-lime-500 mb-3 flex items-center gap-2 border-b border-lime-900 pb-2 uppercase tracking-tighter">
              <Database size={12} /> Neural_Storage
            </h3>
            <div className="space-y-2 h-40 overflow-hidden font-bold">
              {logs.map((log, i) => (
                <div key={i} className="text-[9px] opacity-60 flex gap-2"><span className="text-lime-800">»</span> {log}</div>
              ))}
            </div>
          </div>

          <div className={cn("border-2 p-4 bg-black/80 transition-all duration-500 relative overflow-hidden", profile ? "border-fuchsia-600 shadow-[0_0_20px_#701a75]" : "border-lime-900/20 opacity-40")}>
            <h3 className="text-[10px] font-bold text-fuchsia-400 mb-4 flex items-center gap-2"><BrainCircuit size={14} /> XENO_PSYCH_REPORT</h3>
            {profile ? (
              <div className="space-y-4 animate-in slide-in-from-left">
                <div className="text-xl font-black italic">{profile.type}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow h-2 bg-fuchsia-900/30">
                      <div className="h-full bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" style={{ width: `${profile.threatLevel}%` }} />
                    </div>
                    <span className="text-xs font-bold">{profile.threatLevel.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ) : <div className="h-32 flex items-center justify-center text-[9px] opacity-40 uppercase tracking-widest text-center">Scanning target...</div>}
          </div>

          <button 
            onClick={handleAbduction}
            className="w-full py-4 bg-transparent border-2 border-fuchsia-500 text-fuchsia-500 font-black text-xs hover:bg-fuchsia-500 hover:text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.2)]"
          >
            <Rocket size={16} /> INITIALIZE_ABDUCTION
          </button>
        </aside>

        {/* VISOR CENTRAL */}
        <div className="lg:col-span-9 space-y-4">
          <div className={cn("relative bg-black border-2 transition-all duration-300 shadow-2xl", status === 'success' ? 'border-lime-400' : status === 'error' ? 'border-red-600 animate-shake' : 'border-lime-500/50')}>
            <div className="absolute top-0 w-full bg-lime-500/10 backdrop-blur-md p-3 flex justify-between items-center z-30 border-b border-lime-500/20">
              <div className="flex items-center gap-3 font-black text-xs italic tracking-tighter">
                <Target size={16} className="text-lime-500 animate-pulse" /> TARGET_LOCK: {status.toUpperCase()}
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden">
              <video ref={videoRef} muted playsInline className={cn("w-full h-full object-cover transition-all duration-1000", status === 'idle' ? 'opacity-20 grayscale scale-110' : 'opacity-100 scale-100')} />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 pointer-events-none z-20">
                {status === "scanning" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-lime-400 animate-scan shadow-[0_0_15px_#a3e635]" />
                  </div>
                )}
                {status !== 'idle' && status !== 'scanning' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm animate-in zoom-in">
                    <div className={cn("p-12 border-4 bg-black/90 flex flex-col items-center gap-4", status === 'success' ? 'border-lime-500' : 'border-red-600')}>
                      <div className={cn("text-6xl font-black italic tracking-tighter", status === 'success' ? 'text-lime-500' : 'text-red-600')}>{status === 'success' ? 'AUTHORIZED' : 'UNKNOWN'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#050505] grid grid-cols-2 gap-4">
              <button onClick={() => capture("save")} disabled={!cameraReady || status === "scanning"} className="h-16 border-2 border-lime-500 text-lime-500 font-black hover:bg-lime-500 hover:text-black transition-all">SAVE_DNA</button>
              <button onClick={() => capture("login")} disabled={!cameraReady || !hasRegisteredFace || status === "scanning"} className="h-16 bg-lime-500 text-black font-black hover:bg-white transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]">VERIFY_ID</button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px) rotate(-1deg); } 75% { transform: translateX(8px) rotate(1deg); } }
        .animate-scan { animation: scan 1.8s linear infinite; }
        .animate-shake { animation: shake 0.15s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        @keyframes float-slow { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(30px, -30px); } }
      `}</style>
    </div>
  );
}