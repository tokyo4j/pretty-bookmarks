import subprocess
import shutil

shutil.rmtree("dist", ignore_errors=True)

subprocess.run(["npx", "rollup", "-c"])

mappings = [
    ("src/manifest.json", "dist/"),
    ("src/newtab/newtab.html", "dist/"),
    ("src/popup/popup.html", "dist/"),
]
for src, dst in mappings:
    shutil.copy(src, dst)

shutil.make_archive("pretty-bookmarks", format="zip", root_dir="dist")
