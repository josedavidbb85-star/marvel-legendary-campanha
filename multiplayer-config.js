// Configuração pública do Supabase para a Sala Compartilhada.
// A publishable key é própria para uso no frontend; nunca coloque service_role/secret key aqui.
window.MARVEL_MULTIPLAYER = {
  supabaseUrl: "https://zlrukmdlnymchtxjqsfu.supabase.co",
  supabaseKey: "sb_publishable_xE3peGZJLWM78IhymBA0_A_ifMJHmxf"
};

// Correção de navegação v0.27.1: garante que as abas globais respondam
// mesmo se outro script da campanha interromper a inicialização normal.
document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.getElementById('globalTabs');
  if (!tabs) return;
  tabs.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-g]');
    if (!button) return;
    event.preventDefault();
    const target = button.dataset.g;
    if (typeof window.showGlobal === 'function') {
      window.showGlobal(target);
      return;
    }
    tabs.querySelectorAll('button[data-g]').forEach(b => b.classList.toggle('active', b.dataset.g === target));
    const campaign = document.querySelector('.app');
    if (campaign) campaign.classList.toggle('tab-hidden', target !== 'campaign');
    ['villain','heroes','room'].forEach(name => {
      const panel = document.getElementById(name + 'Screen');
      if (panel) panel.classList.toggle('active', name === target);
    });
  }, true);
});
