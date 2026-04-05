export async function $fetch(url) {
  const res = await fetch(url);
//   console.log('res:', res.json());

//   this.dispatchEvent(new Event("jreact", { bubbles: true }));

//   this._signal();

  if (!res.ok) {
    throw new Error(
      `fetchFile() failed: ${res.status} ${res.statusText} for ${url}`
    );
  }

  // Most of your API/files return JSON.
  return await res.json();
}
