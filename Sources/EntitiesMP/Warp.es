5008
%{
#include "EntitiesMP/StdH/StdH.h"
%}

uses "EntitiesMP/Marker";

class CWarp : CRationalEntity {
name      "Warp";
thumbnail "Thumbnails\\Teleport.tbn";
features  "HasName", "HasTarget", "IsTargetable", "IsImportant";

properties:

  1 CTString m_strName          "Name" 'N' = "Warp",
  2 CTString m_strDescription = "",
  3 CEntityPointer m_penTarget	"Teleport Target" 'T',    // entity to teleport entities to
  4 BOOL m_bActive              "Active" 'A' = TRUE,
  5 FLOAT m_fSize               "Size"  'W' = 1.0f,

components:

  //1 model   MODEL_WARP     "Models\\Warp\\Warp.mdl",
  //2 texture TEXTURE_WARP   "Models\\Warp\\Warp.tex",
  1 model   MODEL_WARP     "Models\\Editor\\Teleport.mdl",
  2 texture TEXTURE_WARP   "Models\\Editor\\Teleport.tex",

functions:

  void Precache(void)
  {
    PrecacheModel(MODEL_WARP);
    PrecacheTexture(TEXTURE_WARP);
	}

  const CTString &GetDescription(void) const {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", m_penTarget->GetName());
    }
    return m_strDescription;
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
    if( slPropertyOffset == offsetof(CMarker, m_penTarget))
    {
      if (IsOfClass(penTarget, "Marker")) { return TRUE; }
      else { return FALSE; }
    }   
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    colAmbient = C_WHITE;
    return FALSE;
  }

  void TeleportEntity(CEntity *pen, const CPlacement3D &pl)
  {
    // teleport 
    pen->Teleport(pl, FALSE);
  }

	void Warp(CEntity *pen)
	{
		if (m_penTarget!=NULL) {
			TeleportEntity(pen, CPlacement3D(m_penTarget->GetPlacement().pl_PositionVector, 
				pen->GetPlacement().pl_OrientationAngle));
		}
	}

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CWarp) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strName.Length();
    return slUsedMemory;
  }

procedures:

  Main(EVoid) {

    // init
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
		// test for almost everything
    SetCollisionFlags( ((ECBI_MODEL|ECBI_PLAYER|ECBI_PROJECTILE_SOLID|ECBI_PROJECTILE_MAGIC)<<ECB_TEST) 
      | ((ECBI_BRUSH)<<ECB_IS) | ((ECBI_PLAYER|ECBI_PROJECTILE_SOLID|ECBI_PROJECTILE_MAGIC)<<ECB_PASS) );

    // set appearance
    GetModelObject()->StretchModel(FLOAT3D(1, 1, 1)*m_fSize);
    SetModel(MODEL_WARP);
    ModelChangeNotify();
		SetModelMainTexture(TEXTURE_WARP);

    while (TRUE) {
      // wait 
      wait() {
        // when something enters
        on (EPass ePass) : { 
					if (m_penTarget!=NULL && m_bActive) {
						Warp(ePass.penOther) ;
					}
        }
        on (EActivate) : {
          m_bActive = TRUE;
          resume;
        }
        on (EDeactivate) : {
          m_bActive = FALSE;
          resume;
        }
				otherwise() : { pass; }
      }
      // wait a bit to recover
      autowait(0.05f);
    }
    return;
  };
};
