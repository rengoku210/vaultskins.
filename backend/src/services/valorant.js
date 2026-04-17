const API_URL = 'https://valorant-api.com/v1/weapons';

export const fetchWeaponSkins = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Valorant API unavailable.');
  }

  const data = await response.json();
  return (data.data || []).flatMap((weapon) =>
    (weapon.skins || []).map((skin) => ({
      uuid: skin.uuid,
      displayName: skin.displayName,
      weapon: weapon.displayName,
      displayIcon: skin.displayIcon || skin.chromas?.[0]?.displayIcon || null,
      video: skin.streamedVideo || null
    }))
  );
};
