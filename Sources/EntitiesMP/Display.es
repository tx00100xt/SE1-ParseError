6134
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Player.h"
#include "condition.h"
%}

enum EDisplayType{
0	EDT_CONSOLE	"Console",
2	EDT_TEXT "On Screen Text",
1	EDT_BAR  "Bar",
};
enum EFontType{
0	EFT_XBOX	"XBOX",
2	EFT_NORMAL "Normal",
1	EFT_CONSOLE  "Console",
};

class CDisplay: CRationalEntity {
name      "Display";
thumbnail "Thumbnails\\Display.tbn";
features  "IsTargetable", "HasName", "IsImportant", "CanBePredictable";

properties:
  1 BOOL m_bActive "Active" =TRUE,
  2 CEntityPointer m_penTarget "Target",
  3 CTString m_strProperty	"Property"="",
  4 CTString m_strText "Text" ="%V",
  5 enum EDisplayType m_eDT "Display Type" =EDT_TEXT,
  7 CTString m_strName   "Name" 'N' = "Display",
  8 CTString m_strParsed "Parsed Text" ="",
  9 CTString m_strTrue "True Text" ="TRUE",
  10 CTString m_strFalse "False Text" ="FALSE",
  11 FLOAT m_fPosX		"Text Pos X" =0.5,
  12 FLOAT m_fPosY		"Text Pos Y" =0.5,
  13 FLOAT m_fScale		"Text Scale" =1,
  14 enum EFontType m_eft "Font Type" =EFT_XBOX,
  15 FLOAT m_fMax		"Bar Max Value"=1,
  16 FLOAT m_fValue=0,
  17 CTFileName m_fnIcon    "Bar Icon"  =CTFILENAME(""),
  18 enum EConType m_eVT	"Display Value Type" =ECT_ENTITY,
  19 BOOL m_bDebug			"Debug Messages"=FALSE,
  20 BOOL m_bCaused			"Target=penCaused"=FALSE,
  21 BOOL m_bDeactivate		"Deactivate on Loss of Target"=TRUE,

components:
  1 model   MODEL_TIME_CONTROLLER     "ModelsMP\\Editor\\Display.mdl",
  2 texture TEXTURE_TIME_CONTROLLER   "TexturesMP\\Detail\\White.tex",

functions:
 /*void AddDependentsToPrediction(void){
	 {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (pen&&IsDerivedFromClass(pen, "Player")) {
	 			pen->AddToPrediction();
			}
	 }}
 }*/
procedures:
  
  

  Main(EVoid)
  {
    // set appearance
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_TIME_CONTROLLER);
    SetModelMainTexture(TEXTURE_TIME_CONTROLLER);
    
    // spawn in world editor
    autowait(0.1f);
	while(TRUE){
		if(m_bActive){
			CTString strReplace;
			FLOAT fValue;
			BOOL bValue;
			INDEX iValue;
			BOOL bstr=FALSE;
			BOOL bi=FALSE;
			BOOL bb=FALSE;
			BOOL bf=FALSE;
			
			if(m_penTarget){
				if(m_eVT==ECT_ENTITY){
					if(m_penTarget->PropertyForName(m_strProperty)!=NULL){
						SLONG offset1=m_penTarget->PropertyForName(m_strProperty)->ep_slOffset; 
						if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_BOOL){
							bValue= *((BOOL *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset1)); 
							bb=TRUE;
						}else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_FLOAT||				
							m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_RANGE||
							m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_ANGLE){

							fValue= *((FLOAT *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset1)); 
							bf=TRUE;						
						}else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_INDEX){
							iValue= *((INDEX *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset1)); 
							bi=TRUE;

						}else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_ENTITYPTR){
							strReplace= (*((CEntityPointer *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset1)))->GetName(); 
							bstr=TRUE;
						}else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_STRING||
							m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_FILENAME){

							strReplace=*((CTString *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset1)); 
							bstr=TRUE;
						}
					}else if( m_bDebug){
						CPrintF(TRANS("%s:Property not found\n"),(const char *)m_strName);
					}
				}else if(m_eVT==ECT_POSX){
					fValue=m_penTarget->GetPlacement().pl_PositionVector(1);
					bf=TRUE;
				}else if(m_eVT==ECT_POSY){
					fValue=m_penTarget->GetPlacement().pl_PositionVector(2);
					bf=TRUE;
				}else if(m_eVT==ECT_POSZ){
					fValue=m_penTarget->GetPlacement().pl_PositionVector(3);
					bf=TRUE;
				}else if(m_eVT==ECT_ROTH){
					fValue=m_penTarget->GetPlacement().pl_OrientationAngle(1);
					bf=TRUE;
				}else if(m_eVT==ECT_ROTP){
					fValue=m_penTarget->GetPlacement().pl_OrientationAngle(2);
					bf=TRUE;
				}else if(m_eVT==ECT_ROTB){
					fValue=m_penTarget->GetPlacement().pl_OrientationAngle(3);
					bf=TRUE;
				}else if(m_penTarget->GetFlags()&ENF_ALIVE&&m_eVT==ECT_HEALTH){
					fValue=((CLiveEntity&)*m_penTarget).en_fHealth;
					bf=TRUE;
				}else if(IsDerivedFromClass(m_penTarget,"MovableEntity")){
					if(m_eVT==ECT_SPEEDX){
						fValue=((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(1);
						bf=TRUE;
					}else if(m_eVT==ECT_SPEEDY){
						fValue=((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(2);
						bf=TRUE;
					}else if(m_eVT==ECT_SPEEDZ){
						fValue=((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(3);
						bf=TRUE;
					}else if(m_eVT==ECT_SPEEDALL){
						fValue=((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute.Length();
						bf=TRUE;
					}else if(m_eVT==ECT_SPEEDXREL){
						CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
						CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penTarget->GetPlacement().pl_OrientationAngle);
						plSpeed.AbsoluteToRelative(plRot);
						fValue=plSpeed.pl_PositionVector(1);
						bf=TRUE;
					}else if(m_eVT==ECT_SPEEDYREL){
						CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
						CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penTarget->GetPlacement().pl_OrientationAngle);
						plSpeed.AbsoluteToRelative(plRot);
						fValue=plSpeed.pl_PositionVector(2);
						bf=TRUE;
					}else if(m_eVT==ECT_SPEEDZREL){
						CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
						CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penTarget->GetPlacement().pl_OrientationAngle);
						plSpeed.AbsoluteToRelative(plRot);
						fValue=plSpeed.pl_PositionVector(3);
						bf=TRUE;
					}

				}else if(m_bDebug){
					CPrintF(TRANS("%s 1: Don't use speeds on not moving entities or health on entities without health\n"),(const char *)m_strName);
				}

			}else if(m_bDebug){
				CPrintF(TRANS("%s:No target set\n"),(const char *)m_strName);
			}
			if (bf){
				strReplace.PrintF(TRANS("%f"),fValue);
				m_fValue=fValue;
			}else if(bi){
				strReplace.PrintF(TRANS("%d"),iValue);
				m_fValue=iValue;
			}else if(bb){
				m_fValue=bValue;
				if(bValue==TRUE){
					strReplace=m_strTrue;
				}else {
					strReplace=m_strFalse;
				}
			}else if(!bstr){
				if(m_bDebug){
					CPrintF(TRANS("%s: Unknown Error(maybe wrong data type)\n"),(const char *)m_strName);
				}
				if(m_bDeactivate){
					{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
						CEntity *pen = iten;
						if(pen){
							if (IsOfClass(pen, "Player")) {
								if(((CPlayer&)*pen).m_dcDisplay.IsMember(this)){
									((CPlayer&)*pen).m_dcDisplay.Remove(this);
								}
							}
						}
					}}
					
					SendEvent(EDeactivate());
				}
			}
			m_strParsed=m_strText;
			
			while(m_strParsed.ReplaceSubstr("%V",strReplace)){}
			
			if(m_eft==EFT_XBOX){
				for(INDEX a=0;a<m_strParsed.Length();a++) { 
					m_strParsed.str_String[a]=toupper(m_strParsed.str_String[a]); 
				}
			}
		}
		wait(0.05f){
			on (EBegin) : {
				resume;
			}
			on (EActivate eActivate) : {
				m_bActive=TRUE;
				resume;
			}
			on (EDeactivate eDeactivate) : {
				m_bActive=FALSE;
				resume;
			}
			on (ETrigger eTrigger) : {
				
				if(m_bActive){
					if(m_bCaused&&eTrigger.penCaused){
						m_penTarget=eTrigger.penCaused;
					}
					if(IsOfClass(eTrigger.penCaused,"Player")){
						if(m_bDebug){
							CPrintF(TRANS("%s: Recieved ETrigger from Player, adding to display list.\n"),(const char *)GetName());
						}
						if(!((CPlayer&)*eTrigger.penCaused).m_dcDisplay.IsMember(this)){
							((CPlayer&)*eTrigger.penCaused).m_dcDisplay.Add(this);
						
						}
					}
				}
				resume;
			}
			on (EStart eStart) : {
				if(IsOfClass(eStart.penCaused,"Player")){
					if(m_bDebug){
						CPrintF(TRANS("%s: Recieved EStart from Player, removing from display list.\n"),(const char *)GetName());
					}
					if(((CPlayer&)*eStart.penCaused).m_dcDisplay.IsMember(this)){
						((CPlayer&)*eStart.penCaused).m_dcDisplay.Remove(this);
					}
				}
				resume;
			}
			on (EEnvironmentStart eStart):{
				if(m_bDebug){
					CPrintF(TRANS("%s: Recieved EEnvironmentStart, adding all players to display list list.\n"),(const char *)GetName());
				}
				CEntityPointer penPlayer;
				for (INDEX iPlayer=0; iPlayer<GetMaxPlayers(); iPlayer++) {
					penPlayer=GetPlayerEntity(iPlayer);
					if(penPlayer!=NULL){
						if(!((CPlayer&)*penPlayer).m_dcDisplay.IsMember(this)){
							((CPlayer&)*penPlayer).m_dcDisplay.Add(this);						
						}
					}
				}
				resume;
			}
			on (EStop):{
				if(m_bDebug){
					CPrintF(TRANS("%s: Recieved ETrigger from Player, removing all players from display list list.\n"),(const char *)GetName());
				}
				CEntityPointer penPlayer;
				for (INDEX iPlayer=0; iPlayer<GetMaxPlayers(); iPlayer++) {
					penPlayer=GetPlayerEntity(iPlayer);
					if(penPlayer!=NULL){
						if(((CPlayer&)*penPlayer).m_dcDisplay.IsMember(this)){
								if(m_bDebug){
									CPrintF(TRANS("%s: Player found, removing us from display list.\n"),(const char *)GetName());
								}
							((CPlayer&)*penPlayer).m_dcDisplay.Remove(this);
						}
					}
				}
				resume;
			}

			on (ETimer) : {
				stop;
			}
		}
	}
  }
};
