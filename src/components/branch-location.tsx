import type { PublicBranch } from "@/server/institutional-repository";

export function BranchLocation({ branch }: { branch: PublicBranch }) {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`;
  return (
    <article className="branch-card">
      <p className="eyebrow">Sucursal activa</p>
      <h2>{branch.name}</h2>
      <p className="branch-address">{branch.address}</p>
      <p className="branch-status">Abierta para consulta de disponibilidad</p>
      <a className="button button-secondary" href={directionsUrl} rel="noreferrer" target="_blank">
        Cómo llegar
      </a>
    </article>
  );
}
