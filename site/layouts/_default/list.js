{{- $.Scratch.Add "section" .Section -}}
{{- $.Scratch.Add "index" slice -}}
{{- range where .Site.Pages "Section" ($.Scratch.Get "section") -}}
{{- $.Scratch.Add "index" (dict "uri" .Permalink "title" .Title "summary" .Summary "tags" .Params.tags "img" .Params.hero.name "alt" .Params.hero.alt "caption" .Params.hero.caption "date" .Params.date "updated" .Params.updated) -}}
{{- end -}}
{{- $.Scratch.Get "index" | jsonify -}}
