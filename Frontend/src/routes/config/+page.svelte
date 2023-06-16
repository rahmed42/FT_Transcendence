<!-- Config page content  -->

// App.svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let photos: string[] = []; // Liste des photos de profil
  let selectedPhotos: string[] = []; // Liste des photos sélectionnées

  onMount(async () => {
    // Ici, tu peux charger les photos depuis une API ou une source de données

    // Exemple de photos statiques
    photos = [
      'photo1.jpg',
      'photo2.jpg',
      'photo3.jpg',
      // Ajoute d'autres photos ici...
    ];
  });

  function toggleSelection(photo: string) {
    if (selectedPhotos.includes(photo)) {
      selectedPhotos = selectedPhotos.filter((selectedPhoto) => selectedPhoto !== photo);
    } else {
      selectedPhotos = [...selectedPhotos, photo];
    }
  }
</script>

<svelte:head>
	<title>Config</title>
	<meta name="description" content="Game CONFIG" />
</svelte:head>

<div class="center">
	<div class="text-column">
		<h1>GAME CONFIG PAGE</h1>
	</div>
</div>

<main>
  <h1>Sélectionnez vos photos de profil</h1>

  {#if photos.length === 0}
    <p>Loading...</p>
  {:else}
    <ul>
      {#each photos as photo}
        <li>
          <label>
            <input
              type="checkbox"
              checked={selectedPhotos.includes(photo)}
              on:change={() => toggleSelection(photo)}
            />
            <img src={photo} alt="Hello World"/>
          </label>
        </li>
      {/each}
    </ul>

    <p>Photos sélectionnées : {selectedPhotos.join(', ')}</p>

    <button on:click={() => console.log(selectedPhotos)}>
      Enregistrer la sélection
    </button>
  {/if}
</main>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
