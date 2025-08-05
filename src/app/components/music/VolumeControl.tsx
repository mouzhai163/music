import React, { useRef, useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type VolumeControlProps = {
  value?: number                // 当前音量（0~1），可选，支持受控/非受控
  muted?: boolean               // 是否静音，可选
  onChange?: (volume: number) => void    // 音量改变回调
  onMuteChange?: (muted: boolean) => void // 静音状态改变回调
  className?: string            // 自定义样式
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  value,
  muted,
  onChange,
  onMuteChange,
  className = "",
}) => {
  // 非受控用本地state
  const [internalVolume, setInternalVolume] = useState(value ?? 1)
  const [internalMuted, setInternalMuted] = useState(muted ?? false)
  const prevVolume = useRef(value ?? 1)

  // 受控 or 非受控
  const realVolume = value !== undefined ? value : internalVolume
  const realMuted = muted !== undefined ? muted : internalMuted

  // 拖动音量条
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (onChange) onChange(v)
    else setInternalVolume(v)
    // 自动处理静音
    if (onMuteChange) onMuteChange(v === 0)
    else setInternalMuted(v === 0)
    if (v > 0) prevVolume.current = v
  }

  // 一键静音/恢复
  const handleToggleMute = () => {
    if (realMuted || realVolume === 0) {
      // 取消静音，恢复音量
      const resume = prevVolume.current || 1
      if (onChange) onChange(resume)
      else setInternalVolume(resume)
      if (onMuteChange) onMuteChange(false)
      else setInternalMuted(false)
    } else {
      prevVolume.current = realVolume
      if (onChange) onChange(0)
      else setInternalVolume(0)
      if (onMuteChange) onMuteChange(true)
      else setInternalMuted(true)
    }
  }

  // 外部受控 volume/muted，内部同步
  useEffect(() => {
    if (value !== undefined) setInternalVolume(value)
  }, [value])
  useEffect(() => {
    if (muted !== undefined) setInternalMuted(muted)
  }, [muted])

  return (
    <div className={`flex items-center gap-2 w-32 ${className}`}>
      <button
        onClick={handleToggleMute}
        className="flex items-center justify-center p-1 rounded-full transition-colors hover:bg-gray-200"
        title={realMuted || realVolume === 0 ? '取消静音' : '一键静音'}
        type="button"
      >
        {realMuted || realVolume === 0 ? (
          <VolumeX size={20} className="text-gray-700" />
        ) : (
          <Volume2 size={20} className="text-gray-700" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={realVolume}
        onChange={handleVolumeChange}
        className="w-20 accent-blue-400"
        aria-label="音量调节"
      />
    </div>
  )
}

export default VolumeControl
