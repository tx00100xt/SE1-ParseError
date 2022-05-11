3974
%{
#include "EntitiesMP/StdH/StdH.h"
%}

enum ECondition{
0	EC_SAME	"==",
2	EC_DIFFERENT "!=",
1	EC_LARGER  ">",
3	EC_SMALLER "<",
4	EC_SMALLER_SAME "<=",
5	EC_LARGER_SAME ">=",
};

enum EConType{
0	ECT_ENTITY		"Property",
1	ECT_POSX		"Pos(X)",
2	ECT_POSY		"Pos(Y)",
3	ECT_POSZ		"Pos(Z)",
4	ECT_SPEEDX		"Speed(X)",
5	ECT_SPEEDY		"Speed(Y)",
6	ECT_SPEEDZ		"Speed(Z)",
7	ECT_SPEEDALL	"Speed(Total)",
8	ECT_ROTH		"Rotation(H)",
9	ECT_ROTB		"Rotation(P)",
10	ECT_ROTP		"Rotation(B)",
11  ECT_SPEEDXREL	"Relative Speed(X)",
12  ECT_SPEEDYREL	"Relative Speed(Y)",
13  ECT_SPEEDZREL	"Relative Speed(Z)",
14  ECT_HEALTH		"Health",
15  ECT_TYPE		"Entity Class",
};

class CCondition: CEntity {
name      "Condition";
thumbnail "Thumbnails\\Condition.tbn";
features  "HasName","IsTargetable";

properties:

1		CTString		m_strName				"Name" 'N'						= "Condition",
2		CTString		m_strDescription										= "Condition",
3		CTString		m_strProperty1			"If Condition Property 1"		= "",
4		CTString		m_strProperty2			"If Condition Property 2"		= "",
5 		CEntityPointer	m_penifCondition1		"If Condition Target 1"			COLOR(C_RED|0xFF),
6 		CEntityPointer	m_penifCondition2		"If Condition Target 2"			COLOR(C_RED|0xFF),
7 		CEntityPointer	m_penifTarget			"If Target"						COLOR(C_RED|0xFF),
8 		CEntityPointer	m_penelseTarget			"Else Target"					COLOR(C_RED|0xFF),
9 		enum			ECondition m_eCondition	"Operation"						=EC_SAME,
10		BOOL			m_bActive				"Active"						=TRUE,
11		BOOL			m_bDebug				"Debug Messages"				=FALSE,
12		BOOL			m_bAbs1					"Absolute 1"					=FALSE,
13		BOOL			m_bAbs2					"Absolute 2"					=FALSE,
14		BOOL			m_bCode					"Output as Script"				=FALSE,
15		enum			EConType	m_eCT1		"Condition Type 1"				=ECT_ENTITY,
16		enum			EConType	m_eCT2		"Condition Type 2"				=ECT_ENTITY,
17		BOOL			m_bCaused1				"Condition Target 1=penCaused"	=FALSE,
18		BOOL			m_bCaused2				"Condition Target 2=penCaused"	=FALSE,
19		CEntityPointer m_penError				"Error Target",			
20		CTString		m_strClass				"Class"	="",
components:

  1 model   MODEL_MARKER     "ModelsMP\\Editor\\Condition.mdl",
  2 texture TEXTURE_MARKER   "ModelsMP\\Editor\\Condition.tex"


functions:

  const CTString &GetDescription(void) const{
    return m_strDescription;
  }

   
  BOOL HandleEvent(const CEntityEvent &ee) { 
	if (ee.ee_slEvent==EVENTCODE_ETrigger) {
		if(m_bActive){
			ETrigger eTrigger = ((ETrigger &) ee);
			if(m_bCaused1&&eTrigger.penCaused){
				m_penifCondition1=eTrigger.penCaused;
			}
			if(m_bCaused2&&eTrigger.penCaused){
				m_penifCondition2=eTrigger.penCaused;
			}
			if(m_penifCondition1){
				BOOL bResult=0,be=0;
				if(m_penifCondition2){
					if(m_bDebug&&m_eCT1==ECT_ENTITY&&m_eCT2==ECT_ENTITY&&m_penifCondition1->PropertyForName(m_strProperty1)&&m_penifCondition2->PropertyForName(m_strProperty2)&&m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType!=m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType){
						CPrintF(TRANS("%s : Different Data Types\n"),m_strName);
					}
				}else{
					if(m_bDebug){
						CPrintF(TRANS("%s:Second Condition Target not set\n"),m_strName);
					}
				}
				if(m_eCT1==ECT_ENTITY&&m_bDebug&&m_penifCondition1->PropertyForName(m_strProperty1)==NULL) { 
					CPrintF(TRANS("Condition 1 : %s : %s Not Found\n"),m_strName,m_strProperty1);
				}else if(m_eCT1==ECT_TYPE){
					if(IsDerivedFromClass(m_penifCondition1, m_strClass)){
						bResult=TRUE;
					}
				}else{
					FLOAT fValue;
					FLOAT fValue2;
					CEntityPointer penPointer;
					CEntityPointer penPointer2;
					CTString strValue;
					CTString strValue2;
					BOOL bf1,bf2,bp1,bp2,bs1,bs2;
					
				
					if(TRUE){
						if(m_eCT1==ECT_ENTITY){
							if(m_penifCondition1->PropertyForName(m_strProperty1)!=NULL){
								SLONG offset1=m_penifCondition1->PropertyForName(m_strProperty1)->ep_slOffset; 
								if(m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_FLOAT||m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_INDEX||m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_RANGE||m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_BOOL||m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_ANGLE){
									fValue= *((FLOAT *)(((UBYTE *)(CEntity*) m_penifCondition1.ep_pen)+offset1)); 
									bf1=TRUE;
								}else if(m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_ENTITYPTR){
									penPointer=*((CEntityPointer *)(((UBYTE *)(CEntity*) m_penifCondition1.ep_pen)+offset1)); 
									bp1=TRUE;
								}else if(m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_STRING||m_penifCondition1->PropertyForName(m_strProperty1)->ep_eptType==CEntityProperty::EPT_FILENAME){
									strValue=*((CTString *)(((UBYTE *)(CEntity*) m_penifCondition1.ep_pen)+offset1)); 
									bs1=TRUE;
								}
							}
						}else if(m_eCT1==ECT_POSX){
							fValue=m_penifCondition1->GetPlacement().pl_PositionVector(1);
							bf1=TRUE;
						}else if(m_eCT1==ECT_POSY){
							fValue=m_penifCondition1->GetPlacement().pl_PositionVector(2);
							bf1=TRUE;
						}else if(m_eCT1==ECT_POSZ){
							fValue=m_penifCondition1->GetPlacement().pl_PositionVector(3);
							bf1=TRUE;
						}else if(m_eCT1==ECT_ROTH){
							fValue=m_penifCondition1->GetPlacement().pl_OrientationAngle(1);
							bf1=TRUE;
						}else if(m_eCT1==ECT_ROTP){
							fValue=m_penifCondition1->GetPlacement().pl_OrientationAngle(2);
							bf1=TRUE;
						}else if(m_eCT1==ECT_ROTB){
							fValue=m_penifCondition1->GetPlacement().pl_OrientationAngle(3);
							bf1=TRUE;
						}else if(m_penifCondition1->GetFlags()&ENF_ALIVE&&m_eCT1==ECT_HEALTH){
							fValue=((CLiveEntity&)*m_penifCondition1).en_fHealth;
							bf1=TRUE;
						}else if(IsDerivedFromClass(m_penifCondition1,"MovableEntity")){
							if(m_eCT1==ECT_SPEEDX){
								fValue=((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute(1);
								bf1=TRUE;
							}else if(m_eCT1==ECT_SPEEDY){
								fValue=((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute(2);
								bf1=TRUE;
							}else if(m_eCT1==ECT_SPEEDZ){
								fValue=((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute(3);
								bf1=TRUE;
							}else if(m_eCT1==ECT_SPEEDALL){
								fValue=((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute.Length();
								bf1=TRUE;
							}else if(m_eCT1==ECT_SPEEDXREL){
								CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
								CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penifCondition1->GetPlacement().pl_OrientationAngle);
								plSpeed.AbsoluteToRelative(plRot);
								fValue=plSpeed.pl_PositionVector(1);
								bf1=TRUE;
							}else if(m_eCT1==ECT_SPEEDYREL){
								CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
								CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penifCondition1->GetPlacement().pl_OrientationAngle);
								plSpeed.AbsoluteToRelative(plRot);
								fValue=plSpeed.pl_PositionVector(2);
								bf1=TRUE;
							}else if(m_eCT1==ECT_SPEEDZREL){
								CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penifCondition1).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
								CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penifCondition1->GetPlacement().pl_OrientationAngle);
								plSpeed.AbsoluteToRelative(plRot);
								fValue=plSpeed.pl_PositionVector(3);
								bf1=TRUE;
							}
						
						}else{
							be=true;
							if(m_bDebug){
								CPrintF(TRANS("%s 1: Don't use speeds on not moving entities or health on entities without health\n"),m_strName);
							}
						}
						if(m_penifCondition2){
							if(m_eCT2==ECT_ENTITY){
								if(m_penifCondition2->PropertyForName(m_strProperty2)!=NULL){
									SLONG offset2=m_penifCondition2->PropertyForName(m_strProperty2)->ep_slOffset; 
									if(m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_FLOAT||m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_INDEX||m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_RANGE||m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_BOOL||m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_ANGLE){
										fValue2= *((FLOAT *)(((UBYTE *)(CEntity*) m_penifCondition2.ep_pen)+offset2)); 
										bf2=TRUE;
									}else if(m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_ENTITYPTR){
										penPointer2=*((CEntityPointer *)(((UBYTE *)(CEntity*) m_penifCondition2.ep_pen)+offset2)); 
										bp2=TRUE;
									}else if(m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_STRING||m_penifCondition2->PropertyForName(m_strProperty2)->ep_eptType==CEntityProperty::EPT_FILENAME){
										strValue2=*((CTString *)(((UBYTE *)(CEntity*) m_penifCondition2.ep_pen)+offset2)); 
										bs2=TRUE;
									}
								}
							}else if(m_eCT2==ECT_POSX){
								fValue2=m_penifCondition2->GetPlacement().pl_PositionVector(1);
								bf2=TRUE;
							}else if(m_eCT2==ECT_POSY){
								fValue2=m_penifCondition2->GetPlacement().pl_PositionVector(2);
								bf2=TRUE;
							}else if(m_eCT2==ECT_POSZ){
								fValue2=m_penifCondition2->GetPlacement().pl_PositionVector(3);
								bf2=TRUE;
							}else if(m_eCT2==ECT_ROTH){
								fValue2=m_penifCondition2->GetPlacement().pl_OrientationAngle(1);
								bf2=TRUE;
							}else if(m_eCT2==ECT_ROTP){
								fValue2=m_penifCondition2->GetPlacement().pl_OrientationAngle(2);
								bf2=TRUE;
							}else if(m_eCT2==ECT_ROTB){
								fValue2=m_penifCondition2->GetPlacement().pl_OrientationAngle(3);
								bf2=TRUE;
							}else if(m_penifCondition2->GetFlags()&ENF_ALIVE&&m_eCT2==ECT_HEALTH){
								fValue2=((CLiveEntity&)*m_penifCondition2).en_fHealth;
								bf2=TRUE;
							}else if(IsDerivedFromClass(m_penifCondition1,"MovableEntity")){
								if(m_eCT2==ECT_SPEEDX){
									fValue2=((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute(1);
									bf2=TRUE;
								}else if(m_eCT2==ECT_SPEEDY){
									fValue2=((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute(2);
									bf2=TRUE;
								}else if(m_eCT2==ECT_SPEEDZ){
									fValue2=((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute(3);
									bf2=TRUE;
								}else if(m_eCT2==ECT_SPEEDALL){
									fValue2=((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute.Length();
									bf2=TRUE;
								}else if(m_eCT2==ECT_SPEEDXREL){
									CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
									CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penifCondition2->GetPlacement().pl_OrientationAngle);
									plSpeed.AbsoluteToRelative(plRot);
									fValue2=plSpeed.pl_PositionVector(1);
									bf2=TRUE;
								}else if(m_eCT2==ECT_SPEEDYREL){
									CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
									CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penifCondition2->GetPlacement().pl_OrientationAngle);
									plSpeed.AbsoluteToRelative(plRot);
									fValue2=plSpeed.pl_PositionVector(2);
									bf2=TRUE;
								}else if(m_eCT2==ECT_SPEEDZREL){
									CPlacement3D plSpeed=CPlacement3D(((CMovableEntity&)*m_penifCondition2).en_vCurrentTranslationAbsolute,ANGLE3D(0,0,0));
									CPlacement3D plRot=CPlacement3D(FLOAT3D(0,0,0),m_penifCondition2->GetPlacement().pl_OrientationAngle);
									plSpeed.AbsoluteToRelative(plRot);
									fValue2=plSpeed.pl_PositionVector(3);
									bf2=TRUE;
								}
							}else{
								be=true;
								if(m_bDebug){
									CPrintF(TRANS("%s 2: Don't use speeds on not moving entities or health on entities without health\n"),m_strName);
								}
							}
						}else{
							CPrintF(TRANS("%sSet the second condition target goddammit\n"),GetName());
						}
					}
					
					//FLOAT
					if(bf1&&bf2){
						FLOAT rAbs1=fValue;
						FLOAT rAbs2=fValue2;
						if(m_bAbs1){rAbs1=abs(rAbs1);}
						if(m_bAbs2){rAbs2=abs(rAbs2);}
						if(m_eCondition==EC_SAME){
							if(rAbs1==rAbs2){
								bResult=TRUE;
							}
						}
						if(m_eCondition==EC_DIFFERENT){
							if(rAbs1!=rAbs2){
								bResult=TRUE;
							}
						}
						if(m_eCondition==EC_LARGER){
							if(rAbs1>rAbs2){
								bResult=TRUE;
							}
						}
						if(m_eCondition==EC_LARGER_SAME){
							if(rAbs1>=rAbs2){
								bResult=TRUE;
							}
						}
						if(m_eCondition==EC_SMALLER){
							if(rAbs1<rAbs2){
								bResult=TRUE;
							}
						}
						if(m_eCondition==EC_SMALLER_SAME){
							if(rAbs1<=rAbs2){
								bResult=TRUE;
							}
						}
					}else if(bf1){
						if(fValue>0){
							bResult=TRUE;
						}
					}else if(bp1&&bp2){
						if(penPointer){
							if(penPointer2){
								if(m_eCondition==EC_SAME){
									if(penPointer==penPointer2){
										bResult=TRUE;
									}
								}
								if(m_eCondition==EC_DIFFERENT){
									if(penPointer!=penPointer2){
										bResult=TRUE;
									}
								}
							}else{
								if(m_bDebug){
									CPrintF(TRANS("%s:Second Condition Pointer not set, checking if %s.%s exists instead\n"),m_strName,((CEntity&)*m_penifCondition1).GetName(),m_strProperty1);
								}
								if(penPointer!=NULL){
									bResult=TRUE;
								}
							}
						}

					//String

					}else if(bs1){
						if(bs2){
							if(m_eCondition==EC_SAME){
								if(strValue==strValue2){
									bResult=TRUE;
								}
							}
							if(m_eCondition==EC_DIFFERENT){
								if(strValue!=strValue2){
									bResult=TRUE;
								}
							}
						}else{
							if(strValue!=""){
								bResult=TRUE;
							}
						}
						
					//other
					}else{
						be=true;
						if(m_bDebug){
							CPrintF(TRANS("%s : Unsupported Data Type\n"),m_strName);
						}
					}
				} 
				if(be){
					m_penError->SendEvent(ETrigger());
				}
				//trigger proper target
				if(bResult){
					if(m_penifTarget){
						if(m_bDebug){
							CPrintF(TRANS("%s: Triggering if Target:%s\n"),m_strName,m_penifTarget->GetName());
						}
						m_penifTarget->SendEvent(ETrigger());
					}else if(m_bDebug){
						CPrintF(TRANS("%s: Result=TRUE, but no if Target to trigger\n"),m_strName);
					}
				}else{
					if(m_penelseTarget){
						if(m_bDebug){
							CPrintF(TRANS("%s: Triggering else Target:%s\n"),m_strName,m_penelseTarget->GetName());
						}
						m_penelseTarget->SendEvent(ETrigger());
					}else if(m_bDebug){
						CPrintF(TRANS("%s: Result=FALSE, but no else Target to trigger\n"),m_strName);
					}
				}
			}
		}
	} 
									
	if (ee.ee_slEvent==EVENTCODE_EActivate) {
		m_bActive=TRUE;
	}
	if (ee.ee_slEvent==EVENTCODE_EDeactivate) {
		m_bActive=FALSE;
	}
	return CEntity::HandleEvent(ee); 
  }

procedures:

  Main()
  {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
	if(m_bCode){
		m_bCode=FALSE;
		CTString strCode="if ( ";
		if(m_penifCondition1){
			strCode+=((CEntity&)*m_penifCondition1).GetName();
			if(m_penifCondition1->PropertyForName(m_strProperty1)!=NULL){
				strCode+=".";
				strCode+=m_strProperty1;
			}else{
				strCode+=".[Property not found]";
			}
		}else{
			strCode+="NULL";
		}
		strCode+=" ";
		if(m_eCondition==EC_SAME){
			strCode+="== ";
		}else if(m_eCondition==EC_LARGER){
			strCode+="> ";
		}else if(m_eCondition==EC_LARGER_SAME){
			strCode+=">= ";
		}else if(m_eCondition==EC_SMALLER){
			strCode+="< ";
		}else if(m_eCondition==EC_SMALLER_SAME){
			strCode+="<= ";
		}else if(m_eCondition==EC_DIFFERENT){
			strCode+="!= ";
		}
		if(m_penifCondition2){
			strCode+=((CEntity&)*m_penifCondition2).GetName();
			if(m_penifCondition2->PropertyForName(m_strProperty2)!=NULL){
				strCode+=".";
				strCode+=m_strProperty2;
			}else{
				strCode+=".[Property not found]";
			}
		}else{
			strCode+="NULL";
		}
		strCode+=" ) {\n";
		if(m_penifTarget){
			strCode+="  Trigger(";
			strCode+=((CEntity&)*m_penifTarget).GetName();
			strCode+=");\n}";
		}else{
			strCode+="}";
		}
		if(m_penelseTarget){	
			strCode+=" else {\n";
			strCode+="  Trigger(";
			strCode+=((CEntity&)*m_penelseTarget).GetName();
			strCode+=");\n}";
		}
		WarningMessage(strCode);
	}
    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    return;
  }
};

/*   

  ---------Things to fix----------
  
*/
