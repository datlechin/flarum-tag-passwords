(()=>{var t={n:s=>{var a=s&&s.__esModule?()=>s.default:()=>s;return t.d(a,{a}),a},d:(s,a)=>{for(var r in a)t.o(a,r)&&!t.o(s,r)&&Object.defineProperty(s,r,{enumerable:!0,get:a[r]})},o:(t,s)=>Object.prototype.hasOwnProperty.call(t,s)};(()=>{"use strict";const s=flarum.core.compat["admin/app"];var a=t.n(s);const r=flarum.core.compat["common/extend"],o=flarum.core.compat["tags/models/Tag"];var e=t.n(o);const i=flarum.core.compat["common/Model"];var n=t.n(i);const l=flarum.core.compat["tags/components/EditTagModal"];var d=t.n(l);const p=flarum.core.compat["utils/Stream"];var c=t.n(p);const u=flarum.core.compat["common/helpers/icon"];var g=t.n(u);const _=flarum.core.compat["common/components/Button"];var f=t.n(_);const w=flarum.core.compat["common/components/Dropdown"];var h=t.n(w);const b=flarum.core.compat["common/models/Group"];var P=t.n(b);a().initializers.add("datlechin/flarum-tag-passwords",(function(){a().extensionData.for("datlechin-tag-passwords").registerPermission({permission:"flarum-tag-passwords.display_unlock_icon",icon:"fas fa-unlock",label:a().translator.trans("datlechin-tag-passwords.admin.setting.display_unlock_icon"),allowGuest:!0},"view").registerPermission({permission:"flarum-tag-passwords.display_protected_tag_from_sidebar",icon:"fas fa-bars",label:a().translator.trans("datlechin-tag-passwords.admin.setting.display_protected_tag_from_sidebar"),allowGuest:!0},"view").registerPermission({permission:"flarum-tag-passwords.display_protected_tag_from_tags_page",icon:"fas fa-th-list",label:a().translator.trans("datlechin-tag-passwords.admin.setting.display_protected_tag_from_tags_page"),allowGuest:!0},"view").registerPermission({permission:"flarum-tag-passwords.display_protected_tag_from_discussion_list",icon:"fas fa-list",label:a().translator.trans("datlechin-tag-passwords.admin.setting.display_protected_tag_from_discussion_list"),allowGuest:!0},"view").registerPermission({permission:"flarum-tag-passwords.display_discussion_avatar",icon:"fas fa-user-secret",label:a().translator.trans("datlechin-tag-passwords.admin.setting.discussion.avatar"),allowGuest:!0},"view").registerPermission({permission:"flarum-tag-passwords.display_protected_tag_from_post_list",icon:"fas fa-pen-square",label:a().translator.trans("datlechin-tag-passwords.admin.setting.display_protected_tag_from_post_list"),allowGuest:!0},"view").registerPermission({permission:"flarum-tag-passwords.display_protected_tag_from_discussion_page",icon:"fas fa-link",label:a().translator.trans("datlechin-tag-passwords.admin.setting.display_protected_tag_from_discussion_page"),allowGuest:!0},"view"),e().prototype.isPasswordProtected=n().attribute("isPasswordProtected"),e().prototype.isGroupProtected=n().attribute("isGroupProtected"),e().prototype.password=n().attribute("password"),e().prototype.protectedGroups=n().attribute("protectedGroups"),(0,r.extend)(d().prototype,"oninit",(function(){this.isPasswordProtected=c()(this.tag.password()||!1),this.password=c()(this.tag.password()||""),this.isGroupProtected=c()(this.tag.protectedGroups()||!1),this.protectedGroups=this.tag.protectedGroups()?JSON.parse(this.tag.protectedGroups()):[]})),(0,r.extend)(d().prototype,"fields",(function(t){var s=this;t.add("protectedType",m("div",{className:"Form-group"},m("label",null,a().translator.trans("datlechin-tag-passwords.admin.edit_tag.protected_label")),m("div",null,m("label",{className:"checkbox"},m("input",{type:"checkbox",bidi:this.isPasswordProtected}),a().translator.trans("datlechin-tag-passwords.admin.edit_tag.password_protected_label")),m("label",{className:"checkbox"},m("input",{type:"checkbox",bidi:this.isGroupProtected}),a().translator.trans("datlechin-tag-passwords.admin.edit_tag.group_protected_label")),this.isPasswordProtected()&&!this.isGroupProtected()?m("input",{className:"FormControl",bidi:this.password,placeholder:a().translator.trans("datlechin-tag-passwords.admin.edit_tag.password_placeholder_label")}):"",this.isGroupProtected()&&!this.isPasswordProtected()?m("table",{className:"GroupListTable"},m("tbody",null,null===this.protectedGroups?m("tr",null,m("td",null,m(LoadingIndicator,null))):this.protectedGroups.map((function(t,r){return m("tr",null,m("td",null,a().store.all("groups").filter((function(s){return s.id()==t.id})).map((function(t){return t.namePlural()}))),m("td",null,m("button",{className:"Button Button--danger",onclick:function(t){t.preventDefault(),s.protectedGroups.splice(r,1),m.redraw()}},g()("fas fa-times"))))})),m("tr",null,m("td",{colspan:"5"},m(h(),{label:a().translator.trans("datlechin-tag-passwords.admin.edit_tag.select_group"),buttonClassName:"Button"},a().store.all("groups").filter((function(t){if(t.id()===P().MEMBER_ID||t.id()===P().GUEST_ID)return!1;var a=!1;return Array.isArray(s.protectedGroups)&&s.protectedGroups.forEach((function(s){s.id==t.id()&&(a=!0)})),!a})).map((function(t){return m(f(),{onclick:function(){s.protectedGroups.push({id:Number(t.id())}),m.redraw()}},t.namePlural())}))))))):"")))})),(0,r.extend)(d().prototype,"submitData",(function(t){t.password=this.isPasswordProtected()?this.password():null,t.protected_groups=this.isGroupProtected()&&this.protectedGroups.length>0?JSON.stringify(this.protectedGroups):null}))}))})(),module.exports={}})();
//# sourceMappingURL=admin.js.map