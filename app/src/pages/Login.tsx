export default function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="text-6xl">🌱</div>
      <h1 className="text-3xl font-extrabold tracking-tight">적립</h1>
      <p className="text-sm leading-relaxed text-[var(--ink2)]">
        매달 25일, 한 주씩 쌓아서
        <br />
        <b className="text-[var(--ink)]">55세에 15억</b> 만들기
      </p>
      <button
        onClick={onLogin}
        className="press mt-6 w-full rounded-2xl bg-[var(--accent)] py-4 font-bold text-white"
      >
        Google로 시작하기
      </button>
      <p className="mt-2 text-[11px] text-[var(--ink3)]">
        데이터는 내 Google 계정으로만 접근할 수 있어요
      </p>
    </div>
  );
}
