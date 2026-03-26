'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Upload, 
  Plus, 
  Database, 
  FileText, 
  Check, 
  AlertCircle, 
  AlertTriangle,
  Pencil,
  Trash2,
  Download,
  X,
  Package
} from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { products, pathways } from '@/lib/data'

type Tab = 'import' | 'create' | 'list'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{ success: number; warnings: number; errors: number } | null>(null)

  const tabs = [
    { id: 'import' as Tab, label: 'Import CSV', icon: Upload },
    { id: 'create' as Tab, label: 'Créer un produit', icon: Plus },
    { id: 'list' as Tab, label: 'Produits en base', icon: Database }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
    }
  }

  const handleImport = () => {
    // Simulate import
    setImportResult({ success: 45, warnings: 3, errors: 1 })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'text/csv') {
      setImportFile(file)
      setImportResult(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar showModeSwitch={false} isAdmin />

      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-2">
              Administration
            </h1>
            <p className="text-text-secondary">
              Gérez votre catalogue de produits MAD
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border pb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-colors shrink-0',
                    activeTab === tab.id
                      ? 'bg-surface-elevated text-primary border-b-2 border-primary -mb-px'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-200">
            {activeTab === 'import' && (
              <ImportTab 
                file={importFile}
                result={importResult}
                onFileChange={handleFileChange}
                onImport={handleImport}
                onDrop={handleDrop}
              />
            )}
            {activeTab === 'create' && <CreateTab />}
            {activeTab === 'list' && <ListTab />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Import Tab
interface ImportTabProps {
  file: File | null
  result: { success: number; warnings: number; errors: number } | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImport: () => void
  onDrop: (e: React.DragEvent) => void
}

function ImportTab({ file, result, onFileChange, onImport, onDrop }: ImportTabProps) {
  return (
    <div className="max-w-2xl">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 text-center transition-colors',
          file ? 'border-primary bg-primary-soft/30' : 'border-border-strong hover:border-primary/50'
        )}
      >
        <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {file ? file.name : 'Glissez votre fichier CSV ici'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {file ? `${(file.size / 1024).toFixed(1)} Ko` : 'ou cliquez pour sélectionner'}
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          <Button variant="outline" className="rounded-xl border-border-strong" asChild>
            <span>Parcourir</span>
          </Button>
        </label>
      </div>

      {/* Preview (mock) */}
      {file && !result && (
        <div className="mt-6 bg-surface-elevated rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Aperçu (8 premières lignes)</span>
            <span className="text-sm text-text-secondary">49 lignes détectées</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Référence</th>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Nom</th>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Prix TTC</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 text-text-primary">REF-00{i}</td>
                    <td className="px-4 py-2 text-text-primary">Produit exemple {i}</td>
                    <td className="px-4 py-2 text-text-primary">{(99.90 * i).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border">
            <Button onClick={onImport} className="rounded-xl bg-primary hover:bg-primary-light">
              Importer
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl">
            <Check className="w-5 h-5 text-success" />
            <span className="font-medium text-success">{result.success} produits importés</span>
          </div>
          {result.warnings > 0 && (
            <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="font-medium text-warning">{result.warnings} avertissements</span>
            </div>
          )}
          {result.errors > 0 && (
            <div className="flex items-center gap-3 p-4 bg-danger/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-danger" />
              <span className="font-medium text-danger">{result.errors} erreur(s)</span>
            </div>
          )}
        </div>
      )}

      {/* Download example */}
      <div className="mt-6">
        <a 
          href="#" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
        >
          <Download className="w-4 h-4" />
          Télécharger un exemple CSV
        </a>
      </div>
    </div>
  )
}

// Create Tab
function CreateTab() {
  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    categorie: '',
    prixTTC: '',
    baseLPPR: '',
    codeLPPR: '',
    description: '',
    pointsForts: '',
    motExpert: '',
    badges: [] as string[],
    recommande: false
  })

  const [caracteristiques, setCaracteristiques] = useState([{ key: '', value: '' }])
  const [documents, setDocuments] = useState([{ nom: '', url: '' }])

  const addCaracteristique = () => setCaracteristiques([...caracteristiques, { key: '', value: '' }])
  const removeCaracteristique = (index: number) => setCaracteristiques(caracteristiques.filter((_, i) => i !== index))

  const addDocument = () => setDocuments([...documents, { nom: '', url: '' }])
  const removeDocument = (index: number) => setDocuments(documents.filter((_, i) => i !== index))

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Identité */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Identité</legend>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Référence *</label>
              <Input 
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="DEA-001"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Catégorie *</label>
              <select 
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-surface-elevated text-text-primary"
              >
                <option value="">Sélectionner...</option>
                {pathways.map((p) => (
                  <option key={p.slug} value={p.nom}>{p.nom}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">Nom du produit *</label>
              <Input 
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Déambulateur pliant 4 roues Premium"
                className="rounded-xl"
              />
            </div>
          </div>
        </fieldset>

        {/* Tarification */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Tarification</legend>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Prix TTC *</label>
              <Input 
                type="number"
                step="0.01"
                value={formData.prixTTC}
                onChange={(e) => setFormData({ ...formData, prixTTC: e.target.value })}
                placeholder="189.90"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Base LPPR</label>
              <Input 
                type="number"
                step="0.01"
                value={formData.baseLPPR}
                onChange={(e) => setFormData({ ...formData, baseLPPR: e.target.value })}
                placeholder="54.36"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Code LPPR</label>
              <Input 
                value={formData.codeLPPR}
                onChange={(e) => setFormData({ ...formData, codeLPPR: e.target.value })}
                placeholder="1245978"
                className="rounded-xl"
              />
            </div>
          </div>
        </fieldset>

        {/* Commercialisation */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Commercialisation</legend>
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-6">
              {['vente', 'location', 'prestataire'].map((badge) => (
                <label key={badge} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={formData.badges.includes(badge)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, badges: [...formData.badges, badge] })
                      } else {
                        setFormData({ ...formData, badges: formData.badges.filter(b => b !== badge) })
                      }
                    }}
                  />
                  <span className="text-sm text-text-primary capitalize">{badge}</span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={formData.recommande}
                onCheckedChange={(checked) => setFormData({ ...formData, recommande: !!checked })}
              />
              <span className="text-sm text-text-primary">Produit recommandé</span>
            </label>
          </div>
        </fieldset>

        {/* Contenu */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Contenu</legend>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Points forts (un par ligne)</label>
              <Textarea 
                value={formData.pointsForts}
                onChange={(e) => setFormData({ ...formData, pointsForts: e.target.value })}
                placeholder="Pliage compact&#10;Freins sécurisés&#10;Siège intégré"
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Mot de l&apos;expert</label>
              <Textarea 
                value={formData.motExpert}
                onChange={(e) => setFormData({ ...formData, motExpert: e.target.value })}
                placeholder="Recommandation de l'expert..."
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
        </fieldset>

        {/* Caractéristiques */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Caractéristiques</legend>
          <div className="space-y-3 mt-4">
            {caracteristiques.map((car, i) => (
              <div key={i} className="flex gap-3">
                <Input 
                  value={car.key}
                  onChange={(e) => {
                    const updated = [...caracteristiques]
                    updated[i].key = e.target.value
                    setCaracteristiques(updated)
                  }}
                  placeholder="Nom"
                  className="rounded-xl flex-1"
                />
                <Input 
                  value={car.value}
                  onChange={(e) => {
                    const updated = [...caracteristiques]
                    updated[i].value = e.target.value
                    setCaracteristiques(updated)
                  }}
                  placeholder="Valeur"
                  className="rounded-xl flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCaracteristique(i)}
                  className="rounded-xl shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addCaracteristique} className="rounded-xl border-border-strong gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </fieldset>

        {/* Documents */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Documents</legend>
          <div className="space-y-3 mt-4">
            {documents.map((doc, i) => (
              <div key={i} className="flex gap-3">
                <Input 
                  value={doc.nom}
                  onChange={(e) => {
                    const updated = [...documents]
                    updated[i].nom = e.target.value
                    setDocuments(updated)
                  }}
                  placeholder="Nom du document"
                  className="rounded-xl flex-1"
                />
                <Input 
                  value={doc.url}
                  onChange={(e) => {
                    const updated = [...documents]
                    updated[i].url = e.target.value
                    setDocuments(updated)
                  }}
                  placeholder="URL"
                  className="rounded-xl flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(i)}
                  className="rounded-xl shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addDocument} className="rounded-xl border-border-strong gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </fieldset>

        {/* Image */}
        <fieldset className="bg-surface-elevated rounded-2xl border border-border p-6">
          <legend className="text-lg font-semibold text-text-primary px-2">Image</legend>
          <div className="mt-4">
            <div className="border-2 border-dashed border-border-strong rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Glissez une image ou cliquez pour parcourir</p>
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <Button className="rounded-xl bg-primary hover:bg-primary-light h-12 px-8">
          Enregistrer le produit
        </Button>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-36">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Aperçu en direct</h3>
          <div className="bg-surface-elevated rounded-2xl border border-border p-4 shadow-warm">
            <div className="aspect-square rounded-xl bg-surface-muted mb-4 flex items-center justify-center">
              <Package className="w-12 h-12 text-text-tertiary" />
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {formData.badges.map((badge) => (
                <span
                  key={badge}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-md',
                    badge === 'vente' && 'bg-success/10 text-success',
                    badge === 'location' && 'bg-accent-soft text-accent',
                    badge === 'prestataire' && 'bg-surface-muted text-text-secondary'
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
            <h4 className="font-semibold text-text-primary leading-snug mb-1 line-clamp-2">
              {formData.nom || 'Nom du produit'}
            </h4>
            <p className="text-xs text-text-tertiary mb-3">
              Réf. {formData.reference || 'XXX-000'}
            </p>
            <p className="text-lg font-bold text-text-primary">
              {formData.prixTTC ? `${parseFloat(formData.prixTTC).toFixed(2)} €` : '0,00 €'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// List Tab
function ListTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredProducts = products.filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-surface-elevated rounded-xl border border-border">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-text-secondary">Total produits</p>
            <p className="text-2xl font-bold text-text-primary">{products.length}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-sm text-text-secondary">Dernier import</p>
            <p className="text-sm font-medium text-text-primary">24 mars 2026</p>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl border-danger text-danger hover:bg-danger/10">
          Tout supprimer
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom ou référence..."
          className="max-w-md rounded-xl"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-elevated rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Produit</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary hidden sm:table-cell">Référence</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary hidden md:table-cell">Catégorie</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Prix TTC</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.reference} className="border-t border-border hover:bg-surface-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary line-clamp-1">{product.nom}</p>
                  <p className="text-xs text-text-tertiary sm:hidden">Réf. {product.reference}</p>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">
                  {product.reference}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">
                  {product.categorie}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-text-primary">
                  {product.prixTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/produits/${product.reference}`}>
                      <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    {deleteConfirm === product.reference ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-lg h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(product.reference)}
                        className="rounded-lg h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
