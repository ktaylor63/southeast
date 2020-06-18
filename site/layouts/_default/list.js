{{- $.Scratch.Add "section" .Section -}}
{{- $.Scratch.Add "index" slice -}}
{{- range where .Site.RegularPages "Section" ($.Scratch.Get "section") -}}
{{- if .Params.hero -}}
{{- $.Scratch.Add "index" (dict "uri" .Permalink "title" .Title "summary" .Summary "tags" .Params.tags "img" .Params.hero.name "alt" .Params.hero.alt "caption" .Params.hero.caption "date" .Params.date "updated" .Params.updated "lat" .Params.lat "lng" .Params.lng) -}}
{{- end -}}
{{- end -}}
{{- $.Scratch.Get "index" | jsonify -}}
