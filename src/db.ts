import Dexie from "dexie";

interface BookmarkImage {
  url: string;
  data: Blob;
}

class PrettyBookmarksDB extends Dexie {
  images!: Dexie.Table<BookmarkImage, string>;
  constructor() {
    super("PrettyBookmarksDB");
    this.version(1).stores({
      images: "url,data",
    });
  }
}

const db = new PrettyBookmarksDB();

export default db;
